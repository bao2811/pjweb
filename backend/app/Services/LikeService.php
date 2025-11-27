<?php

namespace App\Services;

use App\Models\Like;
use App\Models\Post;
use App\Models\Event;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LikeService
{
    /**
     * Toggle like cho POST hoặc EVENT
     * - Nếu đã like → xóa like (unlike)
     * - Nếu chưa like → tạo like mới
     * 
     * @param int $userId - ID user
     * @param int $itemId - ID của post hoặc event
     * @param string $type - 'post' hoặc 'event'
     * @return bool
     */
    public function toggleLike($userId, $itemId, $type = 'post')
    {
        try {
            DB::beginTransaction();

            // 1. Tìm item (post hoặc event)
            $item = $type === 'post' ? Post::find($itemId) : Event::find($itemId);
            if (!$item) {
                throw new Exception(ucfirst($type) . ' not found: ID ' . $itemId);
            }

            // 2. Tìm like hiện có - tùy theo type
            $likeQuery = Like::where('user_id', $userId);
            if ($type === 'post') {
                $likeQuery->where('post_id', $itemId);
            } else {
                $likeQuery->where('event_id', $itemId);
            }
            $like = $likeQuery->first();

            // 3. Toggle like
            if ($like) {
                // Đã like → Unlike (xóa)
                $like->delete();
                $isLiked = false;
            } else {
                // Chưa like → Like (tạo mới)
                $data = [
                    'user_id' => $userId,
                    'status' => 1
                ];
                
                if ($type === 'post') {
                    $data['post_id'] = $itemId;
                } else {
                    $data['event_id'] = $itemId;
                }
                
                Like::create($data);
                $isLiked = true;
            }

            // 4. Cập nhật số lượng like
            $likeColumn = $type === 'post' ? 'like_count' : 'likes';
            if (isset($item->{$likeColumn})) {
                $item->{$likeColumn} = max(0, ($item->{$likeColumn} ?? 0) + ($isLiked ? 1 : -1));
                $item->save();
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error toggling like for {$type}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * WRAPPER: Like/Unlike POST
     * Cả 2 hàm đều gọi toggleLike - tự động xử lý
     */
    public function likePost($userId, $postId)
    {
        return $this->toggleLike($userId, $postId, 'post');
    }

    public function unlikePost($userId, $postId)
    {
        return $this->toggleLike($userId, $postId, 'post');
    }

    /**
     * WRAPPER: Like/Unlike EVENT
     * Cả 2 hàm đều gọi toggleLike - tự động xử lý
     */
    public function likeEvent($userId, $eventId)
    {
        return $this->toggleLike($userId, $eventId, 'event');
    }

    public function unlikeEvent($userId, $eventId)
    {
        return $this->toggleLike($userId, $eventId, 'event');
    }

    /**
     * Lấy danh sách người đã like
     */
    public function getLikesByPostId($itemId, $type = 'post')
    {
        try {
            $column = $type === 'post' ? 'post_id' : 'event_id';
            $likes = DB::select(
                "SELECT u.name as username, u.id as user_id, u.image 
                 FROM users u
                 JOIN likes l ON u.id = l.user_id
                 WHERE l.{$column} = ? AND l.status = 1",
                [$itemId]
            );
            return $likes;
        } catch (Exception $e) {
            Log::error('Error fetching likes: ' . $e->getMessage());
            return [];
        }
    }

    public function getListLikeOfEvent($eventId)
    {
        return $this->getLikesByPostId($eventId, 'event');
    }
}
