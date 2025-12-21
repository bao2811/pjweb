<?php

namespace App\Repositories;

use App\Models\Post;
use App\Models\Like;
use Illuminate\Support\Facades\DB;
use Exception;

class LikeRepo
{
    public function getLikeById($id)
    {
        return Like::find($id);
    }

    /**
     * Lấy Like theo ID
     *
     * @param int $id ID của lượt like
     * @return Like|null
     */

    /**
     * Tạo Like mới
     *
     * @param array $data Dữ liệu like (user_id, post_id, status...)
     * @return Like Like vừa tạo
     */
    public function createLike($data) : Like
    {
        return Like::create($data);
    }

    /**
     * Cập nhật trạng thái unlike/like cho một record
     *
     * @param array $data Dữ liệu gồm user_id, post_id, status
     * @return bool True nếu cập nhật thành công
     * @throws Exception Nếu không tìm thấy record
     */
    public function unLike($data) : bool
    {
        $updated = Like::where('user_id', $data['user_id'])
               ->where('post_id', $data['post_id'])
               ->update([
                   'status' => $data['status']
               ]);
        if (!$updated) {
            throw new Exception('Like not found');
        }
        return true;
    }

    /**
     * Lấy tất cả likes
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all()
    {
        return Like::all();
    }

    /**
     * Lưu thay đổi cho model Like
     *
     * @param Like $like Model Like đã chỉnh sửa
     * @return Like|null Trả về model nếu lưu thành công, null nếu thất bại
     */
    public function updateLike(Like $like) : Like
    {   
        return $like->save() ? $like : null;
    }

    public function deleteLikeById($id) : bool
    {
        $like = $this->getLikeById($id);
        if (!$like) {
            throw new Exception('Like not found');
        }
        return $like->delete();
    }


    public function getListLikeByPost($postId)
    {
        $listike = DB::select("SELECT u.username, u.user_id, u.image FROM users u
            JOIN likes l ON u.user_id = l.user_id
            WHERE l.post_id = ? AND l.status = 1", [$postId]);
        return $listike;
    }

    /**
     * Lấy danh sách user đã like một post
     *
     * @param int $postId ID của post
     * @return array Danh sách users (raw query)
     */

    public function getLikeByUserAndPost($userId, $postId)
    {
        return Like::where('user_id', $userId)
                    ->where('post_id', $postId)
                    ->first();
    }

    /**
     * Lấy like record của một user cho một post
     *
     * @param int $userId
     * @param int $postId
     * @return Like|null
     */

    public function findByPostId($postId)
    {
        return Like::where('post_id', $postId)->get();
    }

    /**
     * Lấy tất cả like theo post ID
     *
     * @param int $postId
     * @return \Illuminate\Database\Eloquent\Collection
     */
}

