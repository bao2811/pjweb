<?php

namespace App\Repositories;

use App\Models\JoinEvent;
use App\Models\Noti;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class JoinEventRepo
{
    public function getJoinEventById($id)
    {
        return JoinEvent::find($id);
    }

    public function joinEvent($data) : JoinEvent
    {
        // Kiểm tra điều kiện trước khi insert
        $event = Event::find($data['event_id']);
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Kiểm tra event chưa bắt đầu
        if (now()->gte($event->start_time)) {
            throw new Exception('Event has already started');
        }

        // Kiểm tra user đã đăng ký chưa (kiểm tra TẤT CẢ status)
        $existing = JoinEvent::where('user_id', $data['user_id'])
            ->where('event_id', $data['event_id'])
            ->first();
        
        if ($existing) {
            // Nếu là rejected, cho phép đăng ký lại bằng cách xóa record cũ
            if ($existing->status === 'rejected') {
                $existing->delete();
            } else {
                // Nếu là pending hoặc approved, không cho đăng ký lại
                throw new Exception('You have already registered for this event');
            }
        }
       
        // FIX #2: Kiểm tra max_participants trước khi cho phép đăng ký
        $currentCount = JoinEvent::where('event_id', $data['event_id'])
            ->whereIn('status', ['approved', 'participating'])
            ->count();
        if ($currentCount >= $event->max_participants) {
            throw new Exception('Event is full');
        }

        // Tạo JoinEvent mới bằng Eloquent (trả về JoinEvent model)
        $joinEvent = JoinEvent::create([
            'user_id' => $data['user_id'],
            'event_id' => $data['event_id'],
            'status' => 'pending',
            'created_at' => now(),
        ]);

        // Gửi notification cho manager - với tên sự kiện và URL đến trang quản lý thành viên
        $notification = Noti::createAndPush([
            'title' => "Yêu cầu tham gia '{$event->title}' 📩",
            'message' => "Có người muốn tham gia sự kiện '{$event->title}'. Vui lòng duyệt yêu cầu.",
            'sender_id' => $data['user_id'],
            'receiver_id' => $event->author_id,
            'type' => 'event_join_request',
            'data' => [
                'event_id' => $data['event_id'],
                'event_title' => $event->title,
                'user_id' => $data['user_id'],
                'url' => "/manager/events/{$data['event_id']}"
            ]
        ]);

        broadcast(new \App\Events\NotificationSent($notification, $event->author_id))->toOthers();

        return $joinEvent;
    }

    /**
     * FIX #1, #5: User có thể hủy đăng ký khi status='pending' hoặc 'approved'
     * nhưng chỉ khi sự kiện chưa diễn ra
     */
    public function leaveEvent($userId, $eventId)
    {
        // FIX #1: Sử dụng Eloquent thay vì DB::update
        // FIX #5: Cho phép hủy cả khi status='approved', miễn sự kiện chưa bắt đầu
        $joinEvent = JoinEvent::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->whereIn('status', ['pending', 'approved']) // FIX #5: Cho phép hủy cả approved
            ->whereHas('event', function($query) {
                $query->where('start_time', '>', now()); // Chỉ cho hủy nếu chưa diễn ra
            })
            ->first();
            
        if ($joinEvent) {
            $event = Event::find($eventId);
            
            // Gửi thông báo xác nhận hủy đăng ký
            if ($event) {
                $notification = Noti::createAndPush([
                    'title' => 'Đã hủy đăng ký sự kiện ✓',
                    'message' => "Bạn đã hủy đăng ký tham gia sự kiện '{$event->title}'.",
                    'sender_id' => $userId,
                    'receiver_id' => $userId,
                    'type' => 'event_leave',
                    'data' => [
                        'event_id' => $eventId,
                        'url' => "/events"
                    ]
                ]);
                
                broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
            }
            
            return $joinEvent->delete();
        }
        
        return false;
    }
    

    public function all()
    {
        return JoinEvent::all();
    }

    /**
     * Lấy danh sách users đã đăng ký tham gia event
     * @param int $eventId
     * @return array
     */
    public function getListUserByEvent($eventId)
    {
        return DB::select(
            "SELECT 
                je.id,
                je.user_id,
                je.event_id,
                je.status,
                je.completion_status,
                je.completed_at,
                je.completion_note,
                je.created_at,
                je.joined_at,
                u.id as user_id,
                u.username,
                u.email,
                u.image
            FROM join_events je
            JOIN users u ON je.user_id = u.id
            WHERE je.event_id = ?
            ORDER BY 
                CASE je.status
                    WHEN 'pending' THEN 1
                    WHEN 'approved' THEN 2
                    WHEN 'rejected' THEN 3
                    ELSE 4
                END,
                je.created_at DESC",
            [$eventId]
        );
    }

    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        $joinEvent = DB::update(
            "UPDATE join_events
             SET status = 'approved', joined_at = NOW()
             WHERE user_id = :user_id
               AND event_id = :event_id
               AND status = 'pending'",
            ['user_id' => $userId, 'event_id' => $eventId]
        );

        if ($joinEvent > 0) {
            // Lấy thông tin event
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user
            if ($event) {
                $notification = Noti::createAndPush([
                    'title' => "Đã được duyệt vào '{$event->title}' 🎉",
                    'message' => "Bạn đã được chấp nhận tham gia sự kiện '{$event->title}'!",
                    'sender_id' => $managerId, // Manager đang accept
                    'receiver_id' => $userId, // User được accept
                    'type' => 'event_accepted',
                    'data' => [
                        'event_id' => $eventId,
                        'event_title' => $event->title,
                        'url' => "/events/{$eventId}"
                    ]
                ]);
            }

            broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
            
            return $joinEvent;
        }
        throw new Exception('JoinEvent not found');
    }

    /**
     * FIX #12: Update status='rejected' thay vì xóa record
     * Điều này giúp giữ lại lịch sử và cho phép user đăng ký lại sau
     */
    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        $joinEvent = JoinEvent::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('status', 'pending')
            ->first();

        if ($joinEvent) {
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user
            if ($event) {
                $notification = Noti::createAndPush([
                    'title' => "Bị từ chối tham gia '{$event->title}' ❌",
                    'message' => "Yêu cầu tham gia sự kiện '{$event->title}' của bạn đã bị từ chối.",
                    'sender_id' => $managerId,
                    'receiver_id' => $userId,
                    'type' => 'event_rejected',
                    'data' => [
                        'event_id' => $eventId,
                        'event_title' => $event->title,
                        'url' => "/events/{$eventId}"
                    ]
                ]);
                
                broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
            }
            
            // FIX #12: Update status thay vì xóa record
            $joinEvent->status = 'rejected';
            // Note: Database không có cột updated_at, không set
            $joinEvent->save();
            
            return true;
        }
        
        return false;
    }

    /**
     * Mark volunteer as completed/failed
     */
    public function markVolunteerCompletion($eventId, $userId, $managerId, $completionStatus, $completionNote = null)
    {
        $joinEvent = JoinEvent::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('status', 'approved')
            ->first();

        if (!$joinEvent) {
            throw new Exception('Volunteer registration not found or not approved');
        }

        // Chỉ cho phép mark completion nếu chưa được đánh giá (completion_status = pending)
        if ($joinEvent->completion_status !== 'pending') {
            throw new Exception('Volunteer has already been evaluated');
        }

        $joinEvent->completion_status = $completionStatus;
        $joinEvent->completed_at = now();
        $joinEvent->completed_by = $managerId;
        $joinEvent->completion_note = $completionNote;
        $joinEvent->save();

        $event = Event::find($eventId);
        if ($event) {
            $title = $completionStatus === 'completed' 
                ? 'Hoàn thành sự kiện! 🎉'
                : 'Đánh giá sự kiện';
            
            $message = $completionStatus === 'completed'
                ? "Bạn đã hoàn thành sự kiện '{$event->title}'!"
                : "Sự kiện '{$event->title}' - Vui lòng xem đánh giá.";

            $notification = Noti::createAndPush([
                'title' => $title,
                'message' => $message,
                'sender_id' => $managerId,
                'receiver_id' => $userId,
                'type' => 'event_completion',
                'data' => [
                    'event_id' => $eventId,
                    'event_title' => $event->title,
                    'completion_status' => $completionStatus,
                    'url' => "/notification/{$userId}"
                ]
            ]);

            broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
        }

        return $joinEvent;
    }

    /**
     * Get event report with statistics
     */
    public function getEventReport($eventId)
    {
        $event = Event::with('author:id,username,email,image')->find($eventId);
        
        if (!$event) {
            throw new Exception('Event not found');
        }

        $volunteers = DB::table('join_events')
            ->join('users', 'join_events.user_id', '=', 'users.id')
            ->where('join_events.event_id', $eventId)
            ->select(
                'join_events.*',
                'users.username',
                'users.email',
                'users.image'
            )
            ->get();

        $stats = [
            'total_registered' => $volunteers->count(),
            'pending' => $volunteers->where('status', 'pending')->count(),
            'approved' => $volunteers->where('status', 'approved')->count(),
            'rejected' => $volunteers->where('status', 'rejected')->count(),
            'completion_pending' => $volunteers->where('status', 'approved')->where('completion_status', 'pending')->count(),
            'completed' => $volunteers->where('completion_status', 'completed')->count(),
            'failed' => $volunteers->where('completion_status', 'failed')->count(),
        ];

        $startTime = new \DateTime($event->start_time);
        $endTime = new \DateTime($event->end_time);
        $interval = $startTime->diff($endTime);
        $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60);
        
        $stats['event_hours'] = round($hours, 1);
        $stats['total_volunteer_hours'] = round($hours * $stats['completed'], 1);

        $volunteersData = $volunteers->map(function ($v) use ($hours) {
            return [
                'id' => $v->id,
                'user_id' => $v->user_id,
                'username' => $v->username,
                'email' => $v->email,
                'image' => $v->image,
                'status' => $v->status,
                'completion_status' => $v->completion_status,
                'joined_at' => $v->joined_at,
                'completed_at' => $v->completed_at,
                'completion_note' => $v->completion_note,
                'hours' => $v->completion_status === 'completed' ? round($hours, 1) : 0,
            ];
        });

        return [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->content,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->address,
                'category' => $event->category,
                'status' => $event->status,
                'author' => $event->author,
            ],
            'statistics' => $stats,
            'volunteers' => $volunteersData,
        ];
    }

    /**
     * Get manager's events overview report
     */
    public function getManagerEventsReport($managerId)
    {
        $events = Event::where('author_id', $managerId)
            ->orderBy('start_time', 'desc')
            ->get();

        $reports = [];
        foreach ($events as $event) {
            $volunteers = DB::table('join_events')
                ->where('event_id', $event->id)
                ->get();

            $startTime = new \DateTime($event->start_time);
            $endTime = new \DateTime($event->end_time);
            $interval = $startTime->diff($endTime);
            $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60);

            $approved = $volunteers->where('status', 'approved')->count();
            $completed = $volunteers->where('completion_status', 'completed')->count();
            $totalHours = round($hours * $completed, 1);

            $reports[] = [
                'id' => $event->id,
                'title' => $event->title,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'status' => $event->status,
                'category' => $event->category,
                'total_registered' => $volunteers->count(),
                'approved' => $approved,
                'completed' => $completed,
                'event_hours' => round($hours, 1),
                'total_hours' => $totalHours,
                'completion_rate' => $approved > 0 ? round(($completed / $approved) * 100, 1) : 0,
            ];
        }

        $overallStats = [
            'total_events' => count($reports),
            'total_volunteers' => array_sum(array_column($reports, 'approved')),
            'total_completed' => array_sum(array_column($reports, 'completed')),
            'total_hours' => array_sum(array_column($reports, 'total_hours')),
        ];

        return [
            'overview' => $overallStats,
            'events' => $reports,
        ];
    }

}
