<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Exception;

class PostRepo
{
    /**
     * Lấy post theo ID
     *
     * @param int $id ID của post
     * @return Post|null
     */
    public function getPostById($id) : ?Post
    {
        // $post = DB::table('posts')->where('id', 4)->first();
        // dd($post);
        $post = Post::find($id);
        return $post;
    }

    // Backwards-compatible alias used by some services
    /**
     * Alias cho getPostById
     *
     * @param int $id
     * @return Post|null
     */
    public function find($id) : ?Post
    {
        return $this->getPostById($id);
    }

    /**
     * Tạo post mới
     *
     * @param array $data Dữ liệu post
     * @return Post Post vừa tạo
     */
    public function createPost($data) : Post
    {
        return Post::create(attributes: $data);
    }

    /**
     * Cập nhật post theo ID
     *
     * @param int $id ID của post
     * @param array $data Dữ liệu cần cập nhật
     * @return Post Post sau khi cập nhật
     * @throws Exception Nếu post không tồn tại
     */
    public function updatePostById($id, $data) : Post
    {
        $post = $this->getPostById($id);
        if (!$post) {
            throw new Exception('Post not found');
        }
        $post->update($data);
        return $post;
    }

    /**
     * Lấy danh sách posts (feed) với cursor-based pagination
     *
     * @param int|null $currentUserId ID user hiện tại để kiểm tra isLiked
     * @param int|null $lastId ID cuối cùng để phân trang
     * @param int $limit Số lượng trả về
     * @return \Illuminate\Support\Collection
     */
    public function all($currentUserId, $lastId = null, $limit = 20)
    {
        // $posts = DB::table('posts')
        //     ->join('users', 'posts.author_id', '=', 'users.id')
        //     ->leftJoin(DB::raw("(SELECT * FROM likes WHERE user_id = $currentUserId AND status = '1') AS l"), 
        //         'posts.id', '=', 'l.post_id'
        //     )
        //     ->where('posts.status', 'active')
        //     ->select(
        //         'posts.*',
        //         'users.username as name',
        //         'users.image as avatar',
        //         'users.role as role',
        //         DB::raw('CASE WHEN l.id IS NULL THEN 0 ELSE 1 END AS isLiked')
        //     )
        //     ->get();


       $posts = DB::table('posts')
            ->join('users', 'posts.author_id', '=', 'users.id')

            ->leftJoin('likes', function ($join) use ($currentUserId) {
                $join->on('posts.id', '=', 'likes.post_id')
                    ->where('likes.user_id', '=', $currentUserId)
                    ->where('likes.status', '=', 1);   // nếu bạn có status
            })

            ->where('posts.status', 'active')
            ->where('posts.channel_id', null)

            // Nếu có lastId thì thêm điều kiện
            ->when($lastId, function($query) use ($lastId) {
                return $query->where('posts.id', '<', $lastId);
            })

            ->orderBy('posts.id', 'desc')
            ->limit($limit ?? 20)

            ->select(
                'posts.*',
                'users.username as name',
                'users.image as avatar',
                'users.role as role',
                DB::raw('CASE WHEN likes.id IS NULL THEN 0 ELSE 1 END AS isLiked')
            )

            ->get();



        return $posts;


    }

    /**
     * Xóa post theo ID (soft delete -> set status)
     *
     * @param int $id ID của post
     * @return bool True nếu xóa thành công
     * @throws Exception Nếu post không tồn tại
     */
    public function deletePostById($id) : bool
    {
        $post = $this->getPostById($id);
        if (!$post) {
            throw new Exception('Post not found');
        }

        $post->status = 0;
        $post->save();
        return $post->delete();
    }

    /**
     * Tìm kiếm post theo query (title hoặc content)
     *
     * @param string $query Từ khóa tìm kiếm
     * @return \Illuminate\Support\Collection
     */
    public function searchPost($query)
    {
        return Post::where('title', 'LIKE', "%$query%")
                    ->orWhere('content', 'LIKE', "%$query%")
                    ->get();
    }

    /**
     * Cập nhật tổng likes cho tất cả posts thuộc event
     *
     * @param int $eventId ID của event
     * @param int $status 1 = like, 0 = unlike
     */
    public function updateAmountLikes($eventId, $status)
    {
        $posts = Post::where('event_id', $eventId)->get();
        foreach ($posts as $post) {
            $post->like = $post->like + ($status == 1 ? 1 : -1);
            $post->save();
        }
    }

    /**
     * Lấy posts theo user ID
     *
     * @param int $userId
     * @return \Illuminate\Support\Collection
     */
    public function getPostsByUserId($userId)
    {
        return Post::where('user_id', $userId)->get();
    }

    /**
    * Lấy posts theo channel
    *
    * @param int $channelId ID của channel
    * @param int|null $userId ID của user để check is_liked
    * @return \Illuminate\Support\Collection
    */
    public function getPostsByChannel($channelId, $userId = null)
    {
        $currentUserId = $userId;
        
        $posts = Post::with([
                'user:id,username,image,role',
                'comments' => function($query) {
                    $query->whereNull('parent_id') // Chỉ lấy comment gốc
                          ->with(['user:id,username,image,role', 'replies.user:id,username,image,role'])
                          ->orderBy('created_at', 'asc');
                }
            ])
            ->where('channel_id', $channelId)
            ->where('status', 'active')
            ->withCount(['comments', 'likes']) // Chỉ dùng withCount, không with likes collection
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) use ($currentUserId) {
                // Check if user liked this post by querying likes table directly
                // FIX: Phải check status = 1 vì unlike chỉ update status = 0, không xóa record
                $post->is_liked = $currentUserId 
                    ? DB::table('likes')
                        ->where('post_id', $post->id)
                        ->where('user_id', $currentUserId)
                        ->where('status', 1)
                        ->exists()
                    : false;
                
                return $post;
            });
            
        return $posts;
    }


    /**
     * Cập nhật số lượt like cho bài viết (bằng query raw)
     *
     * @param int $postId
     * @param int $status 1=like, 0=unlike
     * @param int $totalLikes Tổng likes hiện tại
     * @return int Số bản ghi bị ảnh hưởng
     */
    public function updateLikeOfPost($postId, $status, $totalLikes)
    {
        $like = $totalLikes + ($status == 1 ? 1 : -1);
        $post = DB::table('posts')
            ->where('id', $postId)
            ->update(['likes' => $like]);
        return $post;
    }
}