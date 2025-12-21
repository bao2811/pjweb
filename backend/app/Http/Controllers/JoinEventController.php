<?php

namespace App\Http\Controllers;

use App\Utils\WebPushApi;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Http\Request;
use App\Services\JoinEventService;

/**
 * Controller JoinEventController - Xử lý các thao tác tham gia sự kiện
 * 
 * Controller này xử lý các API endpoint cho chức năng tham gia sự kiện,
 * bao gồm: đăng ký tham gia, hủy tham gia, lấy danh sách đăng ký.
 * 
 * @package App\Http\Controllers
 */
class JoinEventController extends Controller
{
    /** @var JoinEventService Service xử lý logic tham gia sự kiện */
    protected $joinEventService;
    
    /**
     * Khởi tạo controller với JoinEventService
     * 
     * @param JoinEventService $joinEventService Service xử lý logic tham gia sự kiện
     */
    public function __construct(JoinEventService $joinEventService)
    {
        $this->joinEventService = $joinEventService;
    }

    /**
     * Gửi thông báo push đến các subscription của sự kiện
     * 
     * @param Request $request Request chứa subscriptions, title, body, url
     * @return JsonResponse Kết quả gửi thông báo
     */
    public function sendEventNotification(Request $request)
    {
        $subscriptions = $request->input('subscriptions');
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotification($subscriptions, $title, $body, $url);

        return response()->json(['success' => true]);
    }

    // public function sendEventNotificationToAll(Request $request)
    // {
    //     $title = $request->input('title');
    //     $body = $request->input('body');
    //     $url = $request->input('url');

    //     WebPushApi::sendNotificationToAll($title, $body, $url);

    //     return response()->json(['success' => true]);
    // }

    /**
     * Đăng ký tham gia sự kiện
     * 
     * Tạo bản ghi đăng ký với trạng thái pending chờ duyệt.
     * 
     * @param Request $request Request object
     * @param int $eventId ID của sự kiện muốn tham gia
     * @return JsonResponse Kết quả đăng ký
     */
    public function joinEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->joinEventService->joinEvent($user->id, $eventId);
        if(!$data['success']){
            return response()->json(['error' => $data['message']], 404);
        }
        return response()->json(['message' => 'Joined event successfully']);
    }

    /**
     * Hủy đăng ký tham gia sự kiện
     * 
     * @param Request $request Request object
     * @param int $eventId ID của sự kiện muốn hủy tham gia
     * @return JsonResponse Kết quả hủy đăng ký
     */
    public function leaveEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->joinEventService->leaveEvent($user->id, $eventId);
        if(!$data['success']){
            return response()->json(['error' => $data['message']], 404);
        }
        return response()->json(['message' => 'Left event successfully']);
    }

    /**
     * Lấy danh sách các sự kiện đã đăng ký của user hiện tại
     * 
     * @param Request $request Request object
     * @return JsonResponse Danh sách đăng ký tham gia sự kiện
     */
    public function getMyRegistrations(Request $request)
    {
        $user = $request->user();
        $registrations = $this->joinEventService->getMyRegistrations($user->id);
        return response()->json($registrations);
    }
}