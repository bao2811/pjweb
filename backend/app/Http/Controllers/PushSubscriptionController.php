<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Validator;

/**
 * Controller PushSubscriptionController - Xử lý đăng ký nhận push notification
 * 
 * Controller này xử lý các API endpoint cho Web Push Notifications,
 * bao gồm: subscribe, unsubscribe, danh sách subscriptions.
 * Sử dụng VAPID keys để xác thực với push service.
 * 
 * @package App\Http\Controllers
 */
class PushSubscriptionController extends Controller
{
    /**
     * Đăng ký nhận push notifications
     * 
     * Lưu thông tin subscription (endpoint, keys) của client.
     * Sử dụng upsert để tránh trùng lặp subscription.
     * 
     * @param Request $request Request chứa endpoint, keys.p256dh, keys.auth, device_name
     * @return JsonResponse Subscription vừa tạo
     */
    public function subscribe(Request $request)
    {
        $userId = $request->user()->id;
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
            'device_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Tạo hoặc update subscription (upsert)
            $subscription = PushSubscription::updateOrCreate(
                [
                    'user_id' => $userId,
                    'endpoint' => $request->endpoint,
                ],
                [
                    'p256dh' => $request->input('keys.p256dh'),
                    'auth' => $request->input('keys.auth'),
                    'device_name' => $request->device_name ?? 'Unknown Device',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Push subscription created successfully',
                'data' => $subscription
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create push subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy đăng ký nhận push notifications
     * 
     * Xóa subscription theo endpoint.
     * 
     * @param Request $request Request chứa endpoint
     * @return JsonResponse Kết quả hủy đăng ký
     */
    public function unsubscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        try {
            $deleted = PushSubscription::where('user_id', $user->id)
                ->where('endpoint', $request->endpoint)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Push subscription removed successfully'
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove push subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách các thiết bị đã đăng ký của user
     * 
     * Trả về danh sách các subscription với thông tin endpoint, device_name.
     * 
     * @param Request $request Request object
     * @return JsonResponse Danh sách subscriptions
     */
    public function listSubscriptions(Request $request)
    {
        $user = $request->user();

        try {
            $subscriptions = PushSubscription::where('user_id', $user->id)
                ->select('id', 'endpoint', 'device_name', 'created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $subscriptions,
                'count' => $subscriptions->count()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa tất cả subscriptions của user
     * 
     * Hủy đăng ký trên tất cả thiết bị (logout all devices).
     * 
     * @param Request $request Request object
     * @return JsonResponse Số lượng subscriptions đã xóa
     */
    public function unsubscribeAll(Request $request)
    {
        $user = $request->user();

        try {
            $deleted = PushSubscription::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'All push subscriptions removed',
                'count' => $deleted
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
