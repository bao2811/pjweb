<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PushSubscriptionController extends Controller
{
    /**
     * Subscribe user để nhận push notifications
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
     * Unsubscribe user khỏi push notifications
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

        $user = Auth::user();

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
     * Lấy danh sách devices đã subscribe của user
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
     * Xóa tất cả subscriptions của user (logout all devices)
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
