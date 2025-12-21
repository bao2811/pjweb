<?php

namespace App\Services;

use App\Repositories\PostRepo;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Repositories\CommentRepo;
use App\Models\Post;
use App\Repositories\LikeRepo;
use Illuminate\Support\Facades\Log;

/**
 * Service PostService - Xử lý logic nghiệp vụ liên quan đến bài viết
 * 
 * Service này xử lý các thao tác nghiệp vụ cho bài viết,
 * bao gồm: CRUD post, like, comment, tìm kiếm, trending posts.
 * 
 * @package App\Services
 */
class PostService
{
    /** @var PostRepo Repository xử lý dữ liệu bài viết */
    protected $postRepo;
    
    /** @var CommentRepo Repository xử lý dữ liệu bình luận */
    protected $commentRepo;
    
    /** @var LikeRepo Repository xử lý dữ liệu like */
    protected $likeRepo;

    /**
     * Khởi tạo service với các repository cần thiết
     * 
     * @param PostRepo $postRepo Repository bài viết
     * @param CommentRepo $commentRepo Repository bình luận
     * @param LikeRepo $likeRepo Repository like
     */
    public function __construct(PostRepo $postRepo, CommentRepo $commentRepo, LikeRepo $likeRepo)
    {
        $this->postRepo = $postRepo;
        $this->commentRepo = $commentRepo;
        $this->likeRepo = $likeRepo;
    }

    /**
     * Lấy bài viết theo ID
     * 
     * @param int $id ID của bài viết
     * @return Post|null Bài viết hoặc null nếu không tìm thấy
     */
    public function getPostById($id)
    {
        try {
            return $this->postRepo->find($id);
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    /**
     * Tạo bài viết mới
     * 
     * Tự động đặt giá trị mặc định cho likes, comments, status.
     * 
     * @param array $data Dữ liệu bài viết
     * @return Post|null Bài viết vừa tạo hoặc null nếu thất bại
     */
    public function createPost($data)
    {
        try {
            Log::info('PostService createPost called with data:', $data);

            // Đặt giá trị mặc định cho 'likes' và 'comments' (số ít, khớp với database)
            $data['likes'] = $data['likes'] ?? 0;
            $data['comments'] = $data['comments'] ?? 0;
            $data['status'] = $data['status'] ?? 'active';

            $result = $this->postRepo->createPost($data);
            
            Log::info('PostService createPost result:', ['post_id' => $result ? $result->id : null]);
            
            return $result;
        } catch (Exception $e) {
            Log::error('PostService createPost error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Lấy tất cả bài viết với phân trang cursor-based
     * 
     * @param int|null $currentUserId ID của user hiện tại (để kiểm tra isLiked)
     * @param int|null $lastId ID bài viết cuối cùng của trang trước
     * @param int $limit Số lượng bài viết mỗi trang
     * @return array Danh sách bài viết
     */
    public function getAllPosts($currentUserId, $lastId = null, $limit = 20)
    {
        try {
            return $this->postRepo->all($currentUserId, $lastId, $limit);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Cập nhật bài viết theo ID
     * 
     * @param int $id ID của bài viết
     * @param array $data Dữ liệu cần cập nhật
     * @return array|null Kết quả cập nhật
     */
    public function updatePostById($id, $data)
    {
        try {
            $result =  $this->postRepo->updatePostById($id, $data);
            return [
                'success' => $result,
                'message' => $result ? 'Post updated successfully' : 'Post not found'
            ];
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    /**
     * Xóa bài viết theo ID
     * 
     * @param int $id ID của bài viết
     * @return array|null Kết quả xóa
     */
    public function deletePostById($id)
    {
        try {
            $result =  $this->postRepo->deletePostById($id);
            return [
                'success' => $result,
                'message' => $result ? 'Post deleted successfully' : 'Post not found'
            ];
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    /**
     * Tìm kiếm bài viết theo từ khóa
     * 
     * @param string $query Từ khóa tìm kiếm
     * @return array Danh sách bài viết tìm được
     */
    public function searchPosts($query)
    {
        try {
            return $this->postRepo->searchPost($query);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Cập nhật số lượt like của bài viết
     * 
     * @param int $postId ID của bài viết
     * @param int $status 1 để tăng like, -1 để giảm
     * @return bool Kết quả cập nhật
     */
    public function updateLikeOfPost($postId, $status = 1): bool
    {   
        try {

            $post = $this->getPostById($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }
            $post->likes = ($post->likes ?? 0) + $status; // Sửa từ 'likes' thành 'like'
            $post->save();
            return true;
        } catch (Exception $e) {
            // Handle exception
            return false;
        }
    }

    /**
     * Thêm bình luận cho bài viết
     * 
     * Tăng counter comments của bài viết khi thêm comment thành công.
     * Sử dụng transaction để đảm bảo tính nhất quán.
     * 
     * @param int $postId ID của bài viết
     * @param int $userId ID của user bình luận
     * @param string $content Nội dung bình luận
     * @return Comment|null Bình luận vừa tạo
     * @throws Exception Khi nội dung trống
     */
    public function addCommentOfPost($postId, $userId, $content)
    {
        $content = trim($content);
        if ($content === '') {
            throw new Exception('Content cannot be empty');
        }
        // $comment = $this->commentRepo->addCommentOfPost([
        //         'post_id' => $postId,
        //         'author_id' => $userId,
        //         'content'  => $content
        //     ]);
        // return $comment;
        DB::beginTransaction();
        try {
            $comment = $this->commentRepo->addCommentOfPost([
                'post_id' => $postId,
                'author_id' => $userId,
                'content'  => $content
            ]);

            $post = $this->getPostById($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }

            $post->comments += 1;
            $post->save();

            DB::commit();

            return $comment; // Sửa đúng biến
        } catch (Exception $e) {
            DB::rollBack();
            return null;
        }
    }


    /**
     * Lấy danh sách bình luận của bài viết
     * 
     * @param int $postId ID của bài viết
     * @return array Danh sách bình luận
     */
    public function getCommentsOfPost($postId)
    {
        try {
            return $this->commentRepo->getCommentsOfPost($postId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Lấy danh sách người đã like bài viết
     * 
     * @param int $postId ID của bài viết
     * @return array Danh sách likes
     */
    public function getLikesOfPost($postId)
    {
        try {
            return $this->likeRepo->getListLikeByPost($postId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Lấy tất cả bài viết của một user
     * 
     * @param int $userId ID của user
     * @return array Danh sách bài viết
     */
    public function getPostsByUserId($userId)
    {
        try {
            return $this->postRepo->getPostsByUserId($userId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Lấy tất cả bài viết của một channel
     * 
     * @param int $channelId ID của channel
     * @param int|null $userId ID của user (để kiểm tra isLiked)
     * @return array Danh sách bài viết trong channel
     */
    public function getPostsByChannel($channelId, $userId = null)
    {
        try {
            return $this->postRepo->getPostsByChannel($channelId, $userId);
        } catch (Exception $e) {
            Log::error('PostService getPostsByChannel error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    // Thêm comment vào post
    // public function addCommentOfPost(array $data)
    // {
    //     try {
    //         // Validate required fields
    //         if (!isset($data['post_id']) || !isset($data['content'])) {
    //             throw new \Exception('Missing required fields: post_id and content');
    //         }

    //         // Get author_id from auth or request
    //         $authorId = $data['author_id'] ?? auth()->id();
            
    //         if (!$authorId) {
    //             throw new \Exception('Author ID is required');
    //         }

    //         $comment = $this->commentRepo->createComment([
    //             'post_id' => $data['post_id'],
    //             'author_id' => $authorId,
    //             'content' => $data['content'],
    //             'parent_id' => $data['parent_id'] ?? null,
    //         ]);

    //         // Load author relationship
    //         $comment->load('author:id,name,avatar,role');

    //         \Log::info('Comment created successfully:', [
    //             'comment_id' => $comment->id,
    //             'post_id' => $comment->post_id,
    //             'author' => $comment->author->name ?? 'Unknown'
    //         ]);

    //         return $comment;
    //     } catch (\Exception $e) {
    //         \Log::error('Error creating comment: ' . $e->getMessage());
    //         throw $e;
    //     }
    // }

    /**
     * Lấy bài viết trending (nhiều like nhất trong 7 ngày gần đây)
     * 
     * @param int $limit Số lượng bài viết cần lấy (mặc định 5)
     * @return \Illuminate\Support\Collection Danh sách bài viết trending
     */
    public function getTrendingPosts($limit = 5)
    {
        try {
            $sevenDaysAgo = Carbon::now()->subDays(7);
            
            $trendingPosts = Post::with('user:id,username,email,image')
                ->where('created_at', '>=', $sevenDaysAgo)
                ->where('status', 'active')
                ->orderBy('likes', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return $trendingPosts;
        } catch (Exception $e) {
            Log::error('Error getting trending posts: ' . $e->getMessage());
            return collect([]);
        }
    }
}