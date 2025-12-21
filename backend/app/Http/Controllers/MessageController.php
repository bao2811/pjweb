<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Channel;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller MessageController - Xử lý các thao tác tin nhắn trong channel
 * 
 * Controller này xử lý các API endpoint cho chức năng chat,
 * bao gồm: lấy tin nhắn theo channel, gửi tin nhắn, xóa tin nhắn.
 * 
 * @package App\Http\Controllers
 */
class MessageController extends Controller
{
    /**
     * Lấy tất cả tin nhắn trong một channel
     * 
     * Trả về danh sách tin nhắn sắp xếp theo thời gian gửi tăng dần.
     * Kèm thông tin sender (id, username, image).
     * 
     * @param int $channelId ID của channel
     * @return JsonResponse Danh sách tin nhắn
     */
    public function getMessagesByChannel($channelId): JsonResponse
    {
        try {
            $messages = Message::where('channel_id', $channelId)
                ->with('sender:id,username,image')
                ->orderBy('sent_at', 'asc')
                ->get();

            return response()->json(['messages' => $messages], 200);
        } catch (\Exception $e) {
            Log::error('Get Messages Error:', ['error' => $e->getMessage(), 'channel_id' => $channelId]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gửi tin nhắn mới trong channel
     * 
     * Tạo tin nhắn mới với nội dung và sender_id.
     * Tự động lấy sender_id từ user đang đăng nhập.
     * 
     * @param Request $request Request chứa channel_id, content, sender_id
     * @return JsonResponse Tin nhắn vừa tạo
     */
    public function sendMessage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'channel_id' => 'required|exists:channels,id',
                'content' => 'required|string',
                'sender_id' => 'nullable|exists:users,id',
            ]);

            // Ưu tiên auth()->id(), fallback về sender_id từ request (để test)
            $senderId = $request->user()->id;
            
            Log::info('Sending message:', [
                'auth_id' => $senderId,
                'request_sender_id' => $request->sender_id,
                'final_sender_id' => $senderId,
                'has_user' => $request->user() ? 'yes' : 'no'
            ]);

            if (!$senderId) {
                return response()->json(['error' => 'Sender ID is required'], 400);
            }

            $message = Message::create([
                'sender_id' => $senderId,
                'channel_id' => $request->channel_id,
                'content' => $request->input('content'),
                'sent_at' => now(),
            ]);

            $message->load('sender:id,username,image');

            return response()->json($message, 201);
        } catch (\Exception $e) {
            Log::error('Send Message Error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa tin nhắn
     * 
     * Chỉ cho phép sender xóa tin nhắn của mình.
     * 
     * @param Request $request Request object
     * @param int $id ID của tin nhắn cần xóa
     * @return JsonResponse Kết quả xóa
     */
    public function deleteMessage(Request $request, $id): JsonResponse
    {
        try {
            $message = Message::findOrFail($id);
            
            // Only allow deletion by sender
            if ($message->sender_id !== $request->user()->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $message->delete();
            return response()->json(['message' => 'Message deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}