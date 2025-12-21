<?php

namespace App\Services;

use App\Repositories\LikeRepo; 
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\PostService;
use Illuminate\Support\Facades\Validator;
use App\Models\Like;
use App\Models\Event;
use App\Models\Post;

/**
 * Service LikeService - Xử lý logic nghiệp vụ like/unlike
 * 
 * Service này xử lý các thao tác nghiệp vụ cho việc like bài viết và sự kiện,
 * bao gồm: toggle like, like/unlike post/event, get list likes.
 * 
 * @package App\Services
 */
class LikeService
{
    /** @var LikeRepo Repository xử lý dữ liệu like */
    protected $likeRepo;
    
    /** @var PostService Service xử lý bài viết */
    protected $postService;
    
    /** @var EventService Service xử lý sự kiện */
    protected $eventService;

    /**
     * Khởi tạo service với các repository và service cần thiết
     * 
     * @param LikeRepo $likeRepo Repository like
     * @param PostService $postService Service bài viết
     * @param EventService $eventService Service sự kiện
     */
    public function __construct(LikeRepo $likeRepo, PostService $postService, EventService $eventService)
    {
        $this->likeRepo = $likeRepo;
        $this->postService = $postService;
        $this->eventService = $eventService;
    }

    /**
     * Lấy tất cả likes
     * 
     * @return array Danh sách likes
     */
    public function all()
    {
        try {
            return $this->likeRepo->all();
        } catch (Exception $e) {
            Log::error('Error fetching all likes: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Toggle like cho POST hoặc EVENT
     * 
     * Nếu đã like → xóa like (unlike)
     * Nếu chưa like → tạo like mới
     * 
     * @param int $userId ID của user
     * @param int $itemId ID của post hoặc event
     * @param string $type Loại: 'post' hoặc 'event'
     * @return bool Kết quả toggle
     * @throws Exception Khi có lỗi xảy ra
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
     * Like bài viết
     * 
     * Nếu đã like thì bật status, nếu chưa thì tạo mới.
     * Cập nhật like count của post.
     * 
     * @param int $userId ID của user
     * @param int $postId ID của bài viết
     * @return bool Kết quả like
     */
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

    /**
     * Bỏ like bài viết
     * 
     * Cập nhật status = 0 và giảm like count.
     * 
     * @param int $userId ID của user
     * @param int $postId ID của bài viết
     * @return bool Kết quả unlike
     */
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

    /**
     * Lấy danh sách likes theo post ID
     * 
     * @param int $postId ID của bài viết
     * @return array Danh sách likes
     */
    public function getLikesByPostId($postId)
    {
        try {
            return $this->likeRepo->findByPostId($postId);
        } catch (Exception $e) {
            Log::error('Error fetching likes for post: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Lấy danh sách users đã like bài viết
     * 
     * @param int $postId ID của bài viết
     * @return array Danh sách users
     */
    public function getListLikeOfPost($postId)
    {
        try {
            return $this->likeRepo->getListLikeByPost($postId);
        } catch (Exception $e) {
            Log::error('Error fetching likes for post: ' . $e->getMessage());
            return [];
        }
    }

    // ===== EVENT LIKES =====

    /**
     * Like sự kiện
     * 
     * Nếu đã like thì bật status, nếu chưa thì tạo mới.
     * Cập nhật like count của event.
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return bool Kết quả like
     * @throws Exception Khi có lỗi xảy ra
     */
    public function likeEvent($userId, $eventId): bool
    {
        DB::beginTransaction();
        try {
            // Kiểm tra event có tồn tại không
            $event = DB::table('events')->where('id', $eventId)->first();
            if (!$event) {
                throw new Exception('Event not found');
            }

            // Kiểm tra user đã like event này chưa
            $like = DB::table('likes')
                ->where('user_id', $userId)
                ->where('event_id', $eventId)
                ->first();

            if ($like) {
                // Đã like rồi → bật lại status = 1
                DB::table('likes')
                    ->where('user_id', $userId)
                    ->where('event_id', $eventId)
                    ->update(['status' => 1]);
            } else {
                // Chưa like → tạo mới
                DB::table('likes')->insert([
                    'user_id' => $userId,
                    'event_id' => $eventId,
                    'post_id' => null,
                    'status' => 1,
                    'created_at' => now(),
                ]);
            }

            // Cập nhật like count của event
            DB::table('events')
                ->where('id', $eventId)
                ->increment('likes');

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in likeEvent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Bỏ like sự kiện
     * 
     * Cập nhật status = 0 và giảm like count.
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return bool Kết quả unlike
     * @throws Exception Khi có lỗi xảy ra
     */
    public function unlikeEvent($userId, $eventId): bool
    {
        DB::beginTransaction();
        try {
            // Kiểm tra event có tồn tại không
            $event = DB::table('events')->where('id', $eventId)->first();
            if (!$event) {
                throw new Exception('Event not found');
            }

            // Update like status to 0 (unliked)
            $updated = DB::table('likes')
                ->where('user_id', $userId)
                ->where('event_id', $eventId)
                ->update(['status' => 0]);

            if (!$updated) {
                throw new Exception('Like not found');
            }

            // Cập nhật like count của event (giảm 1)
            DB::table('events')
                ->where('id', $eventId)
                ->where('likes', '>', 0)
                ->decrement('likes');

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error unliking event: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Lấy danh sách users đã like sự kiện
     * 
     * @param int $eventId ID của sự kiện
     * @return array Danh sách users (username, user_id, image)
     */
    public function getListLikeOfEvent($eventId)
    {
        try {
            $likes = DB::select(
                "SELECT u.username, u.id as user_id, u.image 
                 FROM users u
                 JOIN likes l ON u.id = l.user_id
                 WHERE l.event_id = ? AND l.status = 1",
                [$eventId]
            );
            return $likes;
        } catch (Exception $e) {
            Log::error('Error fetching likes for event: ' . $e->getMessage());
            return [];
        }
    }
}