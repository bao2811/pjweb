<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\PostService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\LOG;

/**
 * Controller PostController - Xử lý các thao tác liên quan đến bài viết
 * 
 * Controller này xử lý các API endpoint cho bài viết,
 * bao gồm: CRUD bài viết, like/unlike, comment, lấy bài viết theo channel.
 * 
 * @package App\Http\Controllers
 */
class PostController extends Controller
{
    protected $postService;

    /**
     * Khởi tạo controller với PostService
     * 
     * @param PostService $postService Service xử lý logic nghiệp vụ bài viết
     */
    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * Lấy thông tin bài viết theo ID (và cập nhật lượt like)
     * 
     * @param Request $request Request object
     * @param int $id ID của bài viết
     * @return JsonResponse Thông tin bài viết
     */
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

    /**
     * Lấy tất cả bài viết với phân trang
     * 
     * Sử dụng cursor-based pagination với last_id.
     * Trả về danh sách bài viết kèm thông tin isLiked cho user hiện tại.
     * 
     * @param Request $request Request chứa last_id, limit, userId
     * @return JsonResponse Danh sách bài viết
     */
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

    /**
     * Lấy chi tiết bài viết theo ID
     * 
     * @param Request $request Request object
     * @param int $id ID của bài viết
     * @return JsonResponse Chi tiết bài viết
     */
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

    /**
     * Tạo bài viết mới
     * 
     * Validate và tạo bài viết mới với tiêu đề, nội dung, hình ảnh.
     * Yêu cầu user phải đăng nhập để tạo bài.
     * 
     * @param Request $request Request chứa title, content, image, channel_id
     * @return JsonResponse Bài viết vừa tạo
     */
    public function createPost(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string|max:200',
                'content' => 'required|string|min:5|max:5000',
                'image' => 'nullable|string|url|max:500',
                'channel_id' => 'nullable|integer|exists:channels,id',
            ], [
                'title.max' => 'Tiêu đề không được quá 200 ký tự',
                'content.required' => 'Vui lòng nhập nội dung bài viết',
                'content.min' => 'Nội dung phải có ít nhất 5 ký tự',
                'content.max' => 'Nội dung không được quá 5000 ký tự',
                'image.url' => 'URL hình ảnh không hợp lệ',
            ]);

            $postData = $request->only(['title', 'content', 'image', 'channel_id']);
            $userId = $request->user() ? $request->user()->id : null;
            
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $postData['author_id'] = $userId; // Sửa từ user_id thành author_id
            
            $post = $this->postService->createPost($postData);
            if (!$post) {
                return response()->json(['error' => 'Failed to create post'], 500);
            }
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

    /**
     * Xóa bài viết theo ID
     * 
     * Kiểm tra quyền sở hữu trước khi xóa.
     * Chỉ author của bài viết mới có quyền xóa.
     * 
     * @param Request $request Request object
     * @param int $id ID của bài viết cần xóa
     * @return JsonResponse Kết quả xóa
     */
    public function deletePostById(Request $request, $id): JsonResponse
    {
        try {
            $currentUserId = $request->user()->id;
            
            // Check ownership before deleting
            $post = $this->postService->getPostById($id);
            if (!$post) {
                return response()->json(['error' => 'Post not found'], 404);
            }
            
            if ($post->author_id !== $currentUserId) {
                return response()->json(['error' => 'You are not authorized to delete this post'], 403);
            }
            
            $deleted = $this->postService->deletePostById($id);
            if (!$deleted) {
                return response()->json(['error' => 'Failed to delete post'], 500);
            }
            return response()->json(['message' => 'Post deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật bài viết theo ID
     * 
     * Cho phép cập nhật tiêu đề, nội dung và hình ảnh của bài viết.
     * TODO: Cần thêm kiểm tra quyền sở hữu trước khi cập nhật.
     * 
     * @param Request $request Request chứa title, content, image
     * @param int $id ID của bài viết cần cập nhật
     * @return JsonResponse Bài viết sau khi cập nhật
     */
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

    /**
     * Tìm kiếm bài viết
     * 
     * Tìm kiếm bài viết theo từ khóa trong tiêu đề và nội dung.
     * 
     * @param Request $request Request chứa query string
     * @return JsonResponse Danh sách bài viết tìm được
     */
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

    /**
     * Cập nhật lượt like cho bài viết
     * 
     * Tăng/giảm số lượt like của bài viết.
     * 
     * @param Request $request Request chứa status (1=like, 0=unlike)
     * @param int $postId ID của bài viết
     * @return JsonResponse Kết quả cập nhật
     */
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

    /**
     * Thêm bình luận cho bài viết
     * 
     * Validate và thêm bình luận mới cho bài viết.
     * Giới hạn độ dài bình luận từ 2-1000 ký tự.
     * 
     * @param Request $request Request chứa content, postId
     * @return JsonResponse Bình luận vừa tạo
     */
    public function addCommentOfPost(Request $request): JsonResponse
    {
        // Validate input
        $validated = $request->validate([
            'content' => 'required|string|min:2|max:1000',
            'postId' => 'required|integer|exists:posts,id',
        ], [
            'content.required' => 'Vui lòng nhập nội dung bình luận',
            'content.min' => 'Bình luận phải có ít nhất 2 ký tự',
            'content.max' => 'Bình luận không được quá 1000 ký tự',
            'postId.required' => 'ID bài viết không hợp lệ',
            'postId.exists' => 'Bài viết không tồn tại',
        ]);

        $userId = $request->get('userId');
        $comment = $validated['content'];
        $postId = $validated['postId'];

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

    /**
     * Lấy tất cả bài viết của một user
     * 
     * @param Request $request Request object
     * @param int $userId ID của user
     * @return JsonResponse Danh sách bài viết của user
     */
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

    /**
     * Lấy tất cả bình luận của một bài viết
     * 
     * @param Request $request Request object
     * @param int $postId ID của bài viết
     * @return JsonResponse Danh sách bình luận
     */
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

    /**
     * Lấy tất cả bài viết của một channel
     * 
     * Trả về danh sách bài viết trong channel theo channelId.
     * 
     * @param Request $request Request object
     * @param int $channelId ID của channel
     * @return JsonResponse Danh sách bài viết trong channel
     */
    public function getPostsByChannel(Request $request, $channelId): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $posts = $this->postService->getPostsByChannel($channelId, $userId);
            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo bài viết mới trong channel
     * 
     * Kiểm tra quyền trước khi đăng bài:
     * - Channel phải tồn tại và thuộc về một event đã được duyệt
     * - User phải là author, comanager, hoặc đã được approved tham gia event
     * 
     * FIX #10: Thêm kiểm tra quyền - chỉ user đã được approved tham gia sự kiện mới được post
     * 
     * @param Request $request Request chứa channel_id, content, image, author_id
     * @return JsonResponse Bài viết vừa tạo
     */
    public function addPostToChannel(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'channel_id' => 'required|exists:channels,id',
                'content' => 'required|string|max:5000', // FIX: Giới hạn độ dài content
                'image' => 'nullable|string',
                'author_id' => 'nullable|integer',
            ]);

            $authorId = $request->input('author_id') ?? $request->user()->id;
            
            if (!$authorId) {
                Log::error('Create post failed: No author_id', [
                    'auth_id' => $request->user()->id,
                    'request_author' => $request->input('author_id'),
                    'has_user' => $request->user() ? 'yes' : 'no'
                ]);
                return response()->json(['error' => 'Author ID is required'], 400);
            }

            // FIX #10: Kiểm tra quyền truy cập channel
            $channelId = $request->input('channel_id');
            $channel = \App\Models\Channel::find($channelId);
            
            if (!$channel || !$channel->event_id) {
                return response()->json(['error' => 'Channel not found'], 404);
            }

            // Kiểm tra event đã được duyệt chưa (status khác pending/rejected là đã duyệt)
            $event = \App\Models\Event::find($channel->event_id);
            if (!$event || in_array($event->status, ['pending', 'rejected'])) {
                return response()->json(['error' => 'Event is not approved yet. Channel access denied.'], 403);
            }

            // Kiểm tra user có quyền: là author, comanager, hoặc đã được approved tham gia
            $isAuthor = $event->author_id === $authorId;
            $isComanager = $event->comanagers()->where('user_id', $authorId)->exists();
            $isApprovedParticipant = \App\Models\JoinEvent::where('user_id', $authorId)
                ->where('event_id', $event->id)
                ->where('status', 'approved')
                ->exists();

            if (!$isAuthor && !$isComanager && !$isApprovedParticipant) {
                return response()->json([
                    'error' => 'You do not have permission to post in this channel. You must be approved to join the event first.'
                ], 403);
            }

            $postData = [
                'channel_id' => $channelId,
                'content' => $request->input('content'),
                'image' => $request->input('image'),
                'author_id' => $authorId,
                'status' => 'active',
                'title' => '',
            ];

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

    /**
     * Lấy danh sách bài viết trending
     * 
     * Trả về các bài viết có nhiều lượt tương tác nhất.
     * Mặc định trả về 5 bài viết.
     * 
     * @param Request $request Request chứa limit (mặc định 5)
     * @return JsonResponse Danh sách bài viết trending
     */
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