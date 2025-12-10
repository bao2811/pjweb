<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use App\Utils\WebPushApi;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class JoinEventService {
    protected $joinEventRepo;

    public function __construct(JoinEventRepo $joinEventRepo)
    {
        $this->joinEventRepo = $joinEventRepo;
    }

    public function joinEvent($userId, $eventId)
    {
        $result =  $this->joinEventRepo->joinEvent($userId, $eventId);

        if ($result) {
            // Lấy thông tin event
            $event = DB::table('events')->where('id', $eventId)->first();
            $user = DB::table('users')->where('id', $userId)->first();
            
            // Gửi push notification cho user
            try {
                WebPushApi::sendNotificationToUser(
                    $userId,
                    '📝 Đã gửi yêu cầu đăng ký',
                    "Yêu cầu tham gia '{$event->title}' đã được gửi. Đang chờ BTC duyệt.",
                    "/user/events/{$eventId}"
                );
            } catch (\Exception $e) {
                \Log::error('Push notification failed: ' . $e->getMessage());
            }

            // Gửi push notification cho manager/admin của event
            try {
                $managerId = $event->manager_id ?? $event->organizer_id ?? null;
                if ($managerId) {
                    WebPushApi::sendNotificationToUser(
                        $managerId,
                        '🔔 Đăng ký mới',
                        "{$user->name} vừa đăng ký tham gia '{$event->title}'",
                        "/manager/events/{$eventId}/registrations"
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Manager notification failed: ' . $e->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Joined event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    public function leaveEvent($userId, $eventId)
    {
        $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        // kiểm tra check điều kiện để  rời và đăng ký sự kiện

        if ($result) {
            return [
                'success' => true,
                'message' => 'Left event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    public function getMyRegistrations($userId)
    {
        return $this->joinEventRepo->getMyRegistrations($userId);
    }

    public function approveRegistration($registrationId)
    {
        try {
            // Lấy thông tin registration
            $registration = DB::table('event_registrations')
                ->where('id', $registrationId)
                ->first();

            if (!$registration) {
                return false;
            }

            // Update status thành 'accepted'
            DB::table('event_registrations')
                ->where('id', $registrationId)
                ->update(['status' => 'accepted']);

            // Lấy thông tin event và user
            $event = DB::table('events')->where('id', $registration->event_id)->first();
            $user = DB::table('users')->where('id', $registration->user_id)->first();

            // Gửi push notification cho user
            try {
                WebPushApi::sendNotificationToUser(
                    $registration->user_id,
                    '🎉 Đăng ký được chấp nhận!',
                    "Chúc mừng! Bạn đã được chấp nhận tham gia '{$event->title}'",
                    "/user/events/{$registration->event_id}"
                );
            } catch (\Exception $e) {
                \Log::error('Approval notification failed: ' . $e->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Registration approved successfully'
            ];
        } catch (\Exception $e) {
            \Log::error('Approve registration error: ' . $e->getMessage());
            return false;
        }
    }

    public function rejectRegistration($registrationId, $reason = null)
    {
        try {
            // Lấy thông tin registration
            $registration = DB::table('event_registrations')
                ->where('id', $registrationId)
                ->first();

            if (!$registration) {
                return false;
            }

            // Update status thành 'rejected'
            DB::table('event_registrations')
                ->where('id', $registrationId)
                ->update(['status' => 'rejected']);

            // Lấy thông tin event
            $event = DB::table('events')->where('id', $registration->event_id)->first();

            // Gửi push notification cho user
            try {
                $message = "Đăng ký tham gia '{$event->title}' đã bị từ chối";
                if ($reason) {
                    $message .= ". Lý do: {$reason}";
                }

                WebPushApi::sendNotificationToUser(
                    $registration->user_id,
                    '❌ Đăng ký bị từ chối',
                    $message,
                    "/user/events"
                );
            } catch (\Exception $e) {
                \Log::error('Rejection notification failed: ' . $e->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Registration rejected successfully'
            ];
        } catch (\Exception $e) {
            \Log::error('Reject registration error: ' . $e->getMessage());
            return false;
        }
    }

}