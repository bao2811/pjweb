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


}