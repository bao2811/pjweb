<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Like;
use App\Services\LikeService;

class LikeController extends Controller
{
    protected $likeService;

    public function __construct(LikeService $likeService)
    {
        $this->likeService = $likeService;
    }

    // ===== POST LIKES =====
    
    public function likePost(Request $request, $id): JsonResponse
    {
        try {
            $user_id = $request->user()->id;
            $liked = $this->likeService->likePost($user_id, $id);
            if (!$liked) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['message' => 'Post liked successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function unlikePost(Request $request, $id): JsonResponse
    {
        try {
            $user_id = $request->user()->id;
            $unliked = $this->likeService->unlikePost($user_id, $id, 'post');
            if (!$unliked) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['message' => 'Post unliked successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getListLikeOfPost(Request $request, $postId)
    {
        $likes = $this->likeService->getLikesByPostId($postId);
        return response()->json(['likes' => $likes]);
    }

    // ===== EVENT LIKES =====
    
    public function likeEvent(Request $request, $id): JsonResponse
    {
        try {
            $user_id = $request->user()->id;
            $liked = $this->likeService->likeEvent($user_id, $id);
            if (!$liked) {
                return response()->json(['error' => 'Event not found'], 404);
            }
            return response()->json([
                'message' => 'Event liked successfully',
                'isLiked' => true
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function unlikeEvent(Request $request, $id): JsonResponse
    {
        try {
            $user_id = $request->user()->id;
            $unliked = $this->likeService->unlikeEvent($user_id, $id);
            if (!$unliked) {
                return response()->json(['error' => 'Event not found'], 404);
            }
            return response()->json([
                'message' => 'Event unliked successfully',
                'isLiked' => false
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getListLikeOfEvent(Request $request, $eventId)
    {
        $likes = $this->likeService->getListLikeOfEvent($eventId);
        return response()->json(['likes' => $likes]);
    }
}