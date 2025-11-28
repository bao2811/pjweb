<?php

namespace App\Services;

use App\Repositories\LikeRepo; 
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\PostService;

class LikeService
{
    protected $likeRepo;
    protected $postService;

    public function __construct(LikeRepo $likeRepo, PostService $postService)
    {
        $this->likeRepo = $likeRepo;
        $this->postService = $postService;
    }

    public function all()
    {
        try {
            return $this->likeRepo->all();
        } catch (Exception $e) {
            Log::error('Error fetching all likes: ' . $e->getMessage());
            return [];
        }
    }

   public function likePost($userId, $postId) : bool
    {

        // $post = $this->postService->updateLikeOfPost($postId, 1);
        // if (!$post) {
        //     return null;
        // }
        // return $post;
        DB::beginTransaction();
        try {
            // Kiểm tra user đã like chưa
            $like = $this->likeRepo->getLikeByUserAndPost($userId, $postId);

            if ($like) {
                // Đã like → bật status
                $like->status = 1;
                $this->likeRepo->updateLike($like);
            } else {
                // Chưa like → tạo mới
                $this->likeRepo->createLike([
                    'user_id' => $userId,
                    'post_id' => $postId,
                    'status' => 1
                ]);
            }

            // Cập nhật like count của post
            $result = $this->postService->updateLikeOfPost($postId, 1);
                if (!$result) {
                    throw new Exception('Failed to update post likes');
                }

            DB::commit(); // commit nếu mọi thứ OK
            return true;

        } catch (\Exception $e) {
            DB::rollBack(); // rollback nếu có lỗi
            Log::error('Error in likePost: ' . $e->getMessage());
            return false;  // báo lỗi cho controller xử lý
        }
    }

    public function unLikePost($userId, $postId) : bool
    {
        DB::beginTransaction();
        try {
            // Update like status to 0 (unliked)
            $unlike = $this->likeRepo->unLike(['user_id' => $userId, 'post_id' => $postId, 'status' => 0]);
            
            // Update post like count (decrease by 1)
            $result = $this->postService->updateLikeOfPost($postId, -1);
            if (!$result) {
                throw new Exception('Failed to update post likes');
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error unliking post: ' . $e->getMessage());
            return false;
        }
    }

    public function getLikesByPostId($postId)
    {
        try {
            return $this->likeRepo->findByPostId($postId);
        } catch (Exception $e) {
            Log::error('Error fetching likes for post: ' . $e->getMessage());
            return [];
        }
    }

    public function getListLikeOfPost($postId)
    {
        try {
            return $this->likeRepo->getListLikeOfPost($postId);
        } catch (Exception $e) {
            Log::error('Error fetching likes for post: ' . $e->getMessage());
            return [];
        }
    }
}