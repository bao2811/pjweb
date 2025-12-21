<?php

namespace App\Http\Controllers;

use App\Utils\WebPushApi;
use Illuminate\Http\Request;
use App\Services\EventService;
use App\Services\ManagerService;
use Illuminate\Support\Facades\DB;

/**
 * Controller EventController - Xử lý các thao tác liên quan đến sự kiện tình nguyện
 * 
 * Controller này xử lý các API endpoint cho sự kiện,
 * bao gồm: CRUD sự kiện, tìm kiếm, lấy trending, quản lý channel của sự kiện.
 * 
 * @package App\Http\Controllers
 */
class EventController extends Controller
{
    /** @var EventService Service xử lý logic sự kiện */
    protected $eventService;
    
    /** @var ManagerService Service xử lý logic quản lý */
    protected $managerService;
    
    /**
     * Khởi tạo controller với EventService và ManagerService
     * 
     * @param EventService $eventService Service xử lý logic sự kiện
     * @param ManagerService $managerService Service xử lý logic quản lý
     */
    public function __construct(EventService $eventService, ManagerService $managerService){
        $this->eventService = $eventService;
        $this->managerService = $managerService;
    }

    /**
     * Gửi push notification đến các subscription
     * 
     * Sử dụng WebPush API để gửi thông báo đẩy đến client.
     * 
     * @param Request $request Request chứa subscriptions, title, body, url
     * @return JsonResponse Kết quả gửi thông báo
     */
    public function sendNotification(Request $request)
    {
        $subscriptions = $request->input('subscriptions');
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotification($subscriptions, $title, $body, $url);

        return response()->json(['success' => true]);   
    }

    /**
     * Lấy tất cả sự kiện
     * 
     * Trả về danh sách tất cả sự kiện với thông tin user đã like hay chưa.
     * 
     * @param Request $request Request object
     * @return JsonResponse Danh sách sự kiện
     */
    public function getAllEvents(Request $request)
    {
        try{
            // Lấy userId từ authenticated user
            $userId = $request->user() ? $request->user()->id : null;
            $listEvent = $this->eventService->getAllEvents($userId);
            return response()->json(['events' => $listEvent], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách sự kiện trending
     * 
     * Trả về các sự kiện hot (nhiều lượt like nhất trong 7 ngày gần đây).
     * 
     * @param Request $request Request chứa limit (mặc định 5)
     * @return JsonResponse Danh sách sự kiện trending
     */
    public function getTrendingEvents(Request $request)
    {
        try {
            $limit = (int) $request->query('limit', 5);
            $events = $this->eventService->getTrendingEvents($limit);
            return response()->json(['events' => $events], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đếm số lượng sự kiện đang diễn ra
     * 
     * @param Request $request Request object
     * @return JsonResponse Số lượng sự kiện đang diễn ra
     */
    public function countOngoingEvents(Request $request)
    {
        try {
            $count = $this->eventService->countOngoingEvents();
            return response()->json(['count' => $count], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết sự kiện theo ID
     * 
     * Trả về thông tin chi tiết của sự kiện kèm trạng thái đã like hay chưa.
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện
     * @return JsonResponse Chi tiết sự kiện
     */
    public function getEventDetails(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }
        
        // Check if current user has liked this event
        $isLiked = false;
        if ($request->user()) {
            $like = DB::table('likes')
                ->where('user_id', $request->user()->id)
                ->where('event_id', $id)
                ->where('status', 1)
                ->first();
            $isLiked = $like ? true : false;
        }
        
        $eventData = $event->toArray();
        $eventData['is_liked'] = $isLiked;
        
        return response()->json(['event' => $eventData]);
    }

    /**
     * Tạo sự kiện mới
     * 
     * Validate và tạo sự kiện mới với các thông tin:
     * title, content, address, start_time, end_time, image, comanagers, max_participants, category.
     * Tự động gán author_id từ user đang đăng nhập.
     * 
     * @param Request $request Request chứa thông tin sự kiện
     * @return JsonResponse Sự kiện vừa tạo
     */
    public function createEvent(Request $request)
    {
         $request->validate([
            'title' => 'required|string|min:5|max:200',
            'content' => 'required|string|min:20|max:10000',
            'address' => 'required|string|min:5|max:255',
            'start_time' => 'required|date|after_or_equal:today',
            'end_time' => 'required|date|after:start_time',
            'image' => 'nullable|image|max:2048',
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
            'max_participants' => 'required|integer|min:1|max:10000',
            'category' => 'required|string|max:100',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề sự kiện',
            'title.min' => 'Tiêu đề phải có ít nhất 5 ký tự',
            'title.max' => 'Tiêu đề không được quá 200 ký tự',
            'content.required' => 'Vui lòng nhập mô tả sự kiện',
            'content.min' => 'Mô tả phải có ít nhất 20 ký tự',
            'content.max' => 'Mô tả không được quá 10000 ký tự',
            'address.required' => 'Vui lòng nhập địa điểm',
            'address.min' => 'Địa điểm phải có ít nhất 5 ký tự',
            'start_time.required' => 'Vui lòng chọn thời gian bắt đầu',
            'start_time.after_or_equal' => 'Thời gian bắt đầu không được trong quá khứ',
            'end_time.required' => 'Vui lòng chọn thời gian kết thúc',
            'end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu',
            'max_participants.required' => 'Vui lòng nhập số lượng tối đa',
            'max_participants.min' => 'Số lượng tối đa phải lớn hơn 0',
            'max_participants.max' => 'Số lượng tối đa không được vượt quá 10,000',
            'category.required' => 'Vui lòng chọn thể loại',
        ]);

        $eventData = $request->only(['title', 'content', 'start_time', 'end_time', 'address', 'image', 'max_participants', 'category']);
        $eventData['author_id'] = $request->user()->id;
        if ($request->hasFile('image')) {
            $eventData['image'] = $request->file('image')->store('events');
        
        }
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
        
    }

    /**
     * Cập nhật thông tin sự kiện
     * 
     * Cho phép cập nhật title, description, date, image của sự kiện.
     * 
     * @param Request $request Request chứa thông tin cần cập nhật
     * @param int $id ID của sự kiện
     * @return JsonResponse Sự kiện sau khi cập nhật
     */
    public function updateEvent(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|min:5|max:200',
            'description' => 'sometimes|required|string|min:20|max:10000',
            'date' => 'sometimes|required|date',
            'image' => 'nullable|image|max:2048',
        ], [
            'title.min' => 'Tiêu đề phải có ít nhất 5 ký tự',
            'title.max' => 'Tiêu đề không được quá 200 ký tự',
            'description.min' => 'Mô tả phải có ít nhất 20 ký tự',
            'description.max' => 'Mô tả không được quá 10000 ký tự',
        ]);

        $eventData = $request->only(['title', 'description', 'date', 'image']);
        if ($request->hasFile('image')) {
            $eventData['image'] = $request->file('image')->store('events');
        }
        $event = $this->eventService->updateEvent($event, $eventData);

        return response()->json(['event' => $event]);
    }

    /**
     * Xóa sự kiện theo ID
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện cần xóa
     * @return JsonResponse Kết quả xóa
     */
    public function deleteEventById(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $this->eventService->deleteEvent($event);

        return response()->json(['message' => 'Event deleted successfully']);
    }

    /**
     * Tìm kiếm sự kiện
     * 
     * Tìm kiếm sự kiện theo từ khóa trong tiêu đề và nội dung.
     * 
     * @param Request $request Request chứa query string
     * @return JsonResponse Danh sách sự kiện tìm được
     */
    public function searchEvents(Request $request)
    {
        $query = $request->input('query', '');
        $events = $this->eventService->searchEvents($query);
        return response()->json(['events' => $events]);
    }

    /**
     * Lấy channel của sự kiện
     * 
     * Tìm hoặc tạo channel chat cho sự kiện.
     * Sử dụng firstOrCreate để tránh tạo trùng lặp channel.
     * 
     * @param int $id ID của sự kiện
     * @return JsonResponse Channel của sự kiện
     */
    public function getEventChannel($id)
    {
        try {
            $event = $this->eventService->getEventById($id);
            if (!$event) {
                return response()->json(['error' => 'Event not found'], 404);
            }

            // Use firstOrCreate to avoid creating duplicate channels
            // This will find existing channel or create new one atomically
            $channel = \App\Models\Channel::firstOrCreate(
                ['event_id' => $event->id], // Search by event_id
                ['title' => 'Channel - ' . $event->title] // Create with this title if not found
            );

            return response()->json(['channel' => $channel]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}