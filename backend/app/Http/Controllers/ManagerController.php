<?php

namespace App\Http\Controllers;

use App\Services\ManagerService;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Controller ManagerController - Xử lý các thao tác quản lý sự kiện cho Manager
 * 
 * Controller này xử lý các API endpoint cho người quản lý sự kiện (manager),
 * bao gồm: quản lý event, approve/reject user tham gia, đánh giá tình nguyện viên.
 * 
 * @package App\Http\Controllers
 */
class ManagerController extends Controller
{
    /** @var ManagerService Service xử lý logic manager */
    protected  ManagerService $managerService;

    /**
     * Khởi tạo controller với ManagerService
     * 
     * @param ManagerService $managerService Service xử lý logic manager
     */
    public function __construct(ManagerService $managerService)
    {
        $this->managerService = $managerService;
    }

    /**
     * Lấy danh sách người dùng đã đăng ký một sự kiện
     * 
     * Kiểm tra quyền Manager ownership trước khi lấy danh sách.
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện
     * @return JsonResponse Danh sách users đăng ký sự kiện
     */
    public function getListUserByEvent(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $users = $this->managerService->getListUserByEvent($id, $managerId);
            return response()->json([
                'success' => true,
                'users' => $users
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching users for event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Xóa sự kiện
     * 
     * Kiểm tra quyền sở hữu trước khi xóa (FIX #3).
     * Chỉ author hoặc comanager mới có quyền xóa.
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện cần xóa
     * @return JsonResponse Kết quả xóa
     */
    public function deleteEvent(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $result = $this->managerService->deleteEvent($id, $managerId);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error deleting event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
    
    /**
     * Chấp nhận user tham gia sự kiện
     * 
     * Đổi trạng thái đăng ký từ pending sang approved.
     * Gửi thông báo cho user được duyệt.
     * 
     * @param Request $request Request chứa user_id, event_id
     * @return JsonResponse Kết quả duyệt
     */
    public function acceptUserJoinEvent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|integer',
                'event_id' => 'required|integer',
            ]);

            $userId = $request->input('user_id');
            $eventId = $request->input('event_id');
            $managerId = $request->user()->id;
            
            $result = $this->managerService->acceptUserJoinEvent($userId, $eventId, $managerId);
            
            return response()->json([
                'success' => true,
                'message' => 'User approved successfully',
                'data' => $result
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        } catch (Exception $e) {
            Log::error('Error accepting user join event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Từ chối user tham gia sự kiện
     * 
     * Đổi trạng thái đăng ký từ pending sang rejected.
     * Gửi thông báo cho user bị từ chối.
     * 
     * @param Request $request Request chứa user_id, event_id
     * @return JsonResponse Kết quả từ chối
     */
    public function rejectUserJoinEvent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|integer',
                'event_id' => 'required|integer',
            ]);

            $userId = $request->input('user_id');
            $eventId = $request->input('event_id');
            $managerId = $request->user()->id;
            
            $result = $this->managerService->rejectUserJoinEvent($eventId, $userId, $managerId);
            
            return response()->json([
                'success' => true,
                'message' => 'User rejected successfully',
                'data' => $result
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        } catch (Exception $e) {
            Log::error('Error rejecting user join event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo sự kiện mới
     * 
     * Validate và tạo sự kiện với trạng thái pending chờ admin duyệt.
     * FIX #7: Thêm validation start_time phải sau thời điểm hiện tại.
     * 
     * @param Request $request Request chứa thông tin sự kiện
     * @return JsonResponse Sự kiện vừa tạo
     */
    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:5000', // FIX #10 (optional): Giới hạn độ dài content
            'address' => 'required|string|max:255',
            'start_time' => 'required|date|after:now', // FIX #7: start_time phải sau thời điểm hiện tại
            'end_time' => 'required|date|after_or_equal:start_time',
            'image' => 'nullable|string|max:500',
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
            'max_participants' => 'required|integer|min:1',
            'category' => 'required|string|max:100',
        ]);

        $eventData = $request->only(['title', 'content', 'start_time', 'end_time', 'address', 'max_participants', 'category']);
        $eventData['author_id'] = $request->user()->id;
        $eventData['status'] = 'pending';
        
        if (!empty($request->input('image'))) {
            $eventData['image'] = $request->input('image');
        } else {
            $eventData['image'] = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a';
        }
        
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
    }

    /**
     * Lấy danh sách sự kiện do manager quản lý
     * 
     * Bao gồm cả sự kiện là author và sự kiện là comanager.
     * 
     * @param Request $request Request object
     * @return JsonResponse Danh sách sự kiện
     */
    public function getMyEvents(Request $request): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $events = $this->managerService->getEventsByManagerId($managerId);
            
            return response()->json([
                'success' => true,
                'events' => $events
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching manager events: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy chi tiết sự kiện để chỉnh sửa
     * 
     * Kiểm tra quyền truy cập trước khi trả về thông tin.
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện
     * @return JsonResponse Chi tiết sự kiện
     */
    public function getEventDetails(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $event = $this->managerService->getEventById($id, $managerId);
            
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }
            
            return response()->json([
                'success' => true,
                'event' => $event
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching event details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cập nhật thông tin sự kiện
     * 
     * Validate và cập nhật thông tin sự kiện.
     * Gửi thông báo đến admin sau khi cập nhật.
     * FIX #7, #8: Thêm validation start_time > now và kiểm tra lifecycle.
     * 
     * @param Request $request Request chứa thông tin cập nhật
     * @param int $id ID của sự kiện
     * @return JsonResponse Sự kiện sau khi cập nhật
     */
    public function updateEvent(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'title' => 'required|string|min:5|max:200',
                'content' => 'required|string|min:20|max:5000',
                'address' => 'required|string|min:5|max:255',
                'start_time' => 'required|date|after:now',
                'end_time' => 'required|date|after:start_time',
                'image' => 'nullable|string|url|max:500',
                'max_participants' => 'required|integer|min:1|max:10000',
                'category' => 'required|string|max:100',
            ], [
                'title.required' => 'Vui lòng nhập tiêu đề sự kiện',
                'title.min' => 'Tiêu đề phải có ít nhất 5 ký tự',
                'title.max' => 'Tiêu đề không được quá 200 ký tự',
                'content.required' => 'Vui lòng nhập mô tả sự kiện',
                'content.min' => 'Mô tả phải có ít nhất 20 ký tự',
                'content.max' => 'Mô tả không được quá 5000 ký tự',
                'address.required' => 'Vui lòng nhập địa điểm',
                'address.min' => 'Địa điểm phải có ít nhất 5 ký tự',
                'start_time.required' => 'Vui lòng chọn thời gian bắt đầu',
                'start_time.after' => 'Thời gian bắt đầu phải sau thời điểm hiện tại',
                'end_time.required' => 'Vui lòng chọn thời gian kết thúc',
                'end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu',
                'image.url' => 'URL hình ảnh không hợp lệ',
                'max_participants.required' => 'Vui lòng nhập số lượng tối đa',
                'max_participants.min' => 'Số lượng tối đa phải lớn hơn 0',
                'max_participants.max' => 'Số lượng tối đa không được vượt quá 10,000',
                'category.required' => 'Vui lòng chọn thể loại',
            ]);

            $managerId = $request->user()->id;
            $eventData = $request->only([
                'title', 
                'content', 
                'start_time', 
                'end_time', 
                'address', 
                'max_participants', 
                'category',
                'image'
            ]);

            $event = $this->managerService->updateEvent($id, $managerId, $eventData);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully. Admin has been notified.',
                'event' => $event
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error updating event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Đánh dấu hoàn thành tình nguyện viên
     * 
     * Đánh giá tình nguyện viên sau khi sự kiện kết thúc.
     * Trạng thái: completed (hoàn thành) hoặc failed (không hoàn thành).
     * 
     * @param Request $request Request chứa event_id, user_id, status, completion_note
     * @return JsonResponse Kết quả đánh giá
     */
    public function markVolunteerCompletion(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'event_id' => 'required|integer|exists:events,id',
                'user_id' => 'required|integer|exists:users,id',
                // unified participant status: completed or failed
                'status' => 'required|string|in:completed,failed',
                'completion_note' => 'required|string|min:10|max:1000',
            ], [
                'event_id.required' => 'ID sự kiện không hợp lệ',
                'event_id.exists' => 'Sự kiện không tồn tại',
                'user_id.required' => 'ID người dùng không hợp lệ',
                'user_id.exists' => 'Người dùng không tồn tại',
                'status.required' => 'Vui lòng chọn trạng thái hoàn thành',
                'status.in' => 'Trạng thái không hợp lệ',
                'completion_note.required' => 'Vui lòng nhập ghi chú đánh giá',
                'completion_note.min' => 'Ghi chú phải có ít nhất 10 ký tự',
                'completion_note.max' => 'Ghi chú không được quá 1000 ký tự',
            ]);

            $managerId = $request->user()->id;
            $eventId = $request->input('event_id');
            $userId = $request->input('user_id');
            $status = $request->input('status');
            $completionNote = $request->input('completion_note');

            $result = $this->managerService->markVolunteerCompletion(
                $eventId,
                $userId,
                $managerId,
                $status,
                $completionNote
            );

            return response()->json([
                'success' => true,
                'message' => 'Volunteer completion marked successfully',
                'data' => $result
            ], 200);
        } catch (Exception $e) {
            Log::error('Error marking volunteer completion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Lấy báo cáo chi tiết của một sự kiện
     * 
     * Bao gồm thống kê số người tham gia, hoàn thành, không hoàn thành.
     * 
     * @param Request $request Request object
     * @param int $eventId ID của sự kiện
     * @return JsonResponse Báo cáo sự kiện
     */
    public function getEventReport(Request $request, $eventId): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $report = $this->managerService->getEventReport($eventId, $managerId);

            return response()->json([
                'success' => true,
                'report' => $report
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching event report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Lấy báo cáo tổng quan các sự kiện của manager
     * 
     * Thống kê tổng số sự kiện, người tham gia, tỷ lệ hoàn thành.
     * 
     * @param Request $request Request object
     * @return JsonResponse Báo cáo tổng quan
     */
    public function getManagerEventsReport(Request $request): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $report = $this->managerService->getManagerEventsReport($managerId);

            return response()->json([
                'success' => true,
                'report' => $report
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching manager events report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}