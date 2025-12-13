<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Channel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function getMessagesByChannel($channelId): JsonResponse
    {
        try {
            $messages = Message::where('channel_id', $channelId)
                ->with('sender:id,name,avatar')
                ->orderBy('sent_at', 'asc')
                ->get();

            return response()->json(['messages' => $messages], 200);
        } catch (\Exception $e) {
            \Log::error('Get Messages Error:', ['error' => $e->getMessage(), 'channel_id' => $channelId]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sendMessage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'channel_id' => 'required|exists:channels,id',
                'content' => 'required|string',
                'sender_id' => 'nullable|exists:users,id',
            ]);

            // Ưu tiên auth()->id(), fallback về sender_id từ request (để test)
            $senderId = auth()->id() ?? $request->sender_id;
            
            \Log::info('Sending message:', [
                'auth_id' => auth()->id(),
                'request_sender_id' => $request->sender_id,
                'final_sender_id' => $senderId,
                'has_user' => auth()->user() ? 'yes' : 'no'
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

            $message->load('sender:id,name,avatar');

            return response()->json($message, 201);
        } catch (\Exception $e) {
            \Log::error('Send Message Error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteMessage($id): JsonResponse
    {
        try {
            $message = Message::findOrFail($id);
            
            // Only allow deletion by sender
            if ($message->sender_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $message->delete();
            return response()->json(['message' => 'Message deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}