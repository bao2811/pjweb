<?php

namespace App\Services;

use App\Repositories\LikeRepo; 
use Exception;
use Illuminate\Support\Facades\Log;

class LikeService
{
    protected $likeRepo;

    public function __construct(LikeRepo $likeRepo)
    {
        $this->likeRepo = $likeRepo;
    }

    public function likePost($userId, $postId)
    {
        try {
            $like = $this->likeRepo->getLikeByUserAndPost($userId, $postId);
            if ($like) {
                $this-> likeRepo->updateLike($like);
                return $like;
            }
            return $this->likeRepo->create(['user_id' => $userId, 'post_id' => $postId, 'status' => 1]);
        } catch (Exception $e) {
            Log::error('Error liking post: ' . $e->getMessage());
            return null;
        }
    }

    public function unLikePost($userId, $postId)
    {
        try {
            return $this->likeRepo->unLike(['user_id' => $userId, 'post_id' => $postId, 'status' => 0]);
        } catch (Exception $e) {
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