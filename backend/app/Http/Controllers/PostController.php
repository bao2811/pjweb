<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\PostService;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function getPostById(Request $request, $id): JsonResponse
    {
        try {
            $post = $this->postService->updateLikeOfPost($id);
            if (!$post) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['post' => $post], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllPosts(Request $request): JsonResponse
    {
        try {
            $lastId = $request->input('last_id');
            $limit = $request->input('limit', 20);
            $currentUserId = $request->get('userId');
            $posts = $this->postService->getAllPosts($currentUserId, $lastId, $limit);

            if($currentUserId === null){
                return response()->json(['error' => 'Not found'], 404);
            }

            if (empty($posts)) {
                return response()->json(['message' => 'No posts found'], 404);
            }
            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPostDetails(Request $request, $id): JsonResponse
    {
        try {
            $post = $this->postService->getPostById($id);
            if (!$post) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['post' => $post], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function createPost(Request $request): JsonResponse
    {
        try {
            $postData = $request->only(['title', 'content', 'image', 'user_id', 'event_id']);
            $post = $this->postService->createPost($postData);
            return response()->json(['post' => $post], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deletePostById(Request $request, $id): JsonResponse
    {
        try {
            $deleted = $this->postService->deletePostById($id);
            if (!$deleted) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['message' => 'Post deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePostById(Request $request, $id): JsonResponse
    {

        //kiểm tra post có phải của user tạo không
        try {
            $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'image' => 'sometimes|image|max:2048',
            ]);
            $postData = $request->only(['title', 'content', 'image']);
            $post = $this->postService->updatePostById($id, $postData);
            if (!$post) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            return response()->json(['post' => $post], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function searchPosts(Request $request): JsonResponse
    {
        $query = $request->input('query', '');

        try {
            $posts = $this->postService->searchPosts($query);
            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateLikeOfPost(Request $request, $postId): JsonResponse
    {
        $status = $request->input('status'); // 1 for like, 0 for unlike
        try {
            $this->postService->updateLikeOfPost($postId, $status);
            return response()->json(['message' => 'Post like updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function addCommentOfPost(Request $request): JsonResponse
    {
        $userId = $request->get('userId');
        $comment = $request->input('content');
        $postId = $request->input('postId');

        try {
            $comment = $this->postService->addCommentOfPost($postId, $userId, $comment);
            if (!$comment) {
                return response()->json(['error' => 'Failed to add comment'], 400);
            }
            return response()->json(['comment' => $comment], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPostsByUserId(Request $request, $userId): JsonResponse
    {
        try {
            $posts = $this->postService->getPostsByUserId($userId);
            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getCommentsOfPost(Request $request, $postId): JsonResponse
    {
        try {
            $comments = $this->postService->getCommentsOfPost($postId);
            return response()->json(['comments' => $comments], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Lấy tất cả posts của 1 channel
    public function getPostsByChannel(Request $request, $channelId): JsonResponse
    {
        try {
            $userId = $request->query('user_id') ?? auth()->id();
            $posts = $this->postService->getPostsByChannel($channelId, $userId);
            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Tạo post mới trong channel
    public function addPostToChannel(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $request->validate([
                'channel_id' => 'required|exists:channels,id',
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'image' => 'nullable|string',
                'author_id' => 'nullable|exists:users,id', // Tạm thời cho phép gửi author_id
            ]);

            $postData = [
                'channel_id' => $request->input('channel_id'),
                'title' => $request->input('title'),
                'content' => $request->input('content'),
                'image' => $request->input('image'),
                'author_id' => $request->input('author_id', $user->id), // Ưu tiên auth, fallback về auth()->id()
                'status' => 'active',
            ];
            
            if (!$postData['author_id']) {
                return response()->json(['error' => 'Author ID is required'], 400);
            }

            $post = $this->postService->createPost($postData);
            return response()->json(['post' => $post], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTrendingPosts(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 5);
            $trendingPosts = $this->postService->getTrendingPosts($limit);
            
            return response()->json([
                'posts' => $trendingPosts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}