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

    public function likePost($userId, $postId)
    {
        try {
            DB::beginTransaction();

            try {
                $like = $this->likeRepo->getLikeByUserAndPost($userId, $postId);

                if ($like) {
                    $like->status = !$like->status;
                    $this->likeRepo->updateLike($like);
                }
                else {
                    $like = $this->likeRepo->createLike([
                        'user_id' => $userId,
                        'post_id' => $postId,
                        'status' => 1
                    ]);
                }

                $post = $this->postService->getPostById($postId, $like->status);
                if (!$post) {
                    throw new Exception('Post not found');
                }

                $post->like_count += 1;
                $post->save();
            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            Log::error('Error liking post: ' . $e->getMessage());
            return null;
        }
    }

    public function unLikePost($userId, $postId)
    {
        try {
            DB::beginTransaction();
            $result = $this->likeRepo->unLike(['user_id' => $userId, 'post_id' => $postId, 'status' => 0]);
            $this->postService->getPostById($postId, 0);
            DB::commit();
            return $result;
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