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

    public function getAllPosts(Request $request): JsonResponse
    {
        try {
            $posts = $this->postService->getAllPosts();

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
            $postData = $request->only(['title', 'content', 'image', 'event_id']);
            $postData['user_id'] = auth()->id(); // Lấy từ JWT, không tin client
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

    public function deletePost(Request $request, $id): JsonResponse
    {
        try {
            $deleted = $this->postService->deletePost($id);
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

    public function updatePost(Request $request, $id): JsonResponse
    {
        try {
            $postData = $request->only(['title', 'content', 'image']);
            $post = $this->postService->updatePost($id, $postData);
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

    public function addCommentOfPost(Request $request)
{
    try {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Add author_id from current user or request
        $validated['author_id'] = auth()->id() ?? $request->input('author_id');

        $comment = $this->postService->addCommentOfPost($validated);

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at,
                'author' => [
                    'id' => $comment->author->id,
                    'name' => $comment->author->name,
                    'avatar' => $comment->author->avatar,
                    'role' => $comment->author->role,
                ]
            ]
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Error in addCommentOfPost:', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to add comment',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function getPostsByEventId(Request $request, $eventId): JsonResponse
    {
        try {
            $posts = $this->postService->getPostsByEventId($eventId);
            return response()->json(['posts' => $posts], 200);
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
            $request->validate([
                'channel_id' => 'required|exists:channels,id',
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'image' => 'nullable|string',
                'author_id' => 'nullable|exists:users,id', // Tạm thời cho phép gửi author_id
            ]);

            $postData = [
                'channel_id' => $request->channel_id,
                'title' => $request->title,
                'content' => $request->content,
                'image' => $request->image,
                'author_id' => $request->author_id ?? auth()->id(), // Ưu tiên auth, fallback về request
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
}