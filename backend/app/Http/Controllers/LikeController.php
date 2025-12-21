<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Like;
use App\Services\LikeService;

/**
 * Controller LikeController - Xử lý các thao tác like/unlike
 * 
 * Controller này xử lý các API endpoint cho chức năng like,
 * bao gồm: like/unlike bài viết, like/unlike sự kiện.
 * 
 * @package App\Http\Controllers
 */
class LikeController extends Controller
{
    /** @var LikeService Service xử lý logic like */
    protected $likeService;

    /**
     * Khởi tạo controller với LikeService
     * 
     * @param LikeService $likeService Service xử lý logic like
     */
    public function __construct(LikeService $likeService)
    {
        $this->likeService = $likeService;
    }

    /**
     * Lấy tất cả lượt like trong hệ thống
     * 
     * @return JsonResponse Danh sách tất cả likes
     */
    public function getAllLikes(): JsonResponse
    {
        $likes = $this->likeService->all();
        return response()->json(['likes' => $likes]);
    }
    
    /**
     * Like một bài viết
     * 
     * @param Request $request Request object
     * @param int $id ID của bài viết cần like
     * @return JsonResponse Kết quả like
     */
    public function likePost(Request $request, $id)
    {
        try {
            $user_id = $request->user()->id;
            $liked = $this->likeService->likePost($user_id, $id);

            if (!$liked) {
                return response()->json(['error' => 'Posts Not Found'], 404);
            }

            return response()->json(['message' => 'Post liked successfully', 'post' => $liked], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bỏ like một bài viết (unlike)
     * 
     * @param Request $request Request object
     * @param int $id ID của bài viết cần unlike
     * @return JsonResponse Kết quả unlike
     */
    public function unlikePost(Request $request, $id)
    {
        try {
            $user_id = $request->user()->id;
            $unliked = $this->likeService->unLikePost($user_id, $id);
            if (!$unliked) {
                return response()->json(['error' => 'Like not found or already unliked'], 404);
            }
            return response()->json(['message' => 'Post unliked successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách người đã like một bài viết
     * 
     * @param Request $request Request object
     * @param int $postId ID của bài viết
     * @return JsonResponse Danh sách likes của bài viết
     */
    public function getListLikeOfPost(Request $request, $postId)
    {
        $likes = $this->likeService->getLikesByPostId($postId);
        return response()->json(['likes' => $likes]);
    }

    // ===== EVENT LIKES =====
    
    /**
     * Like một sự kiện
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện cần like
     * @return JsonResponse Kết quả like với trạng thái isLiked
     */
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

    /**
     * Bỏ like một sự kiện (unlike)
     * 
     * @param Request $request Request object
     * @param int $id ID của sự kiện cần unlike
     * @return JsonResponse Kết quả unlike với trạng thái isLiked
     */
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

    /**
     * Lấy danh sách người đã like một sự kiện
     * 
     * @param Request $request Request object
     * @param int $eventId ID của sự kiện
     * @return JsonResponse Danh sách likes của sự kiện
     */
    public function getListLikeOfEvent(Request $request, $eventId)
    {
        $likes = $this->likeService->getListLikeOfEvent($eventId);
        return response()->json(['likes' => $likes]);
    }
}