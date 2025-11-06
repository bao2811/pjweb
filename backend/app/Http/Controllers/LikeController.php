<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Like;
use App\Services\LikeService;

class LikeController extends Controller
{
    protected $likeService;

    public function __construct(LikeService $likeService)
    {
        $this->likeService = $likeService;
    }

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
            $unliked = $this->likeService->unlikePost($id);
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
}