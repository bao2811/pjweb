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

    public function createLike($data) : Like
    {
        return Like::create($data);
    }

    public function unLike($data) : bool
    {
        $like = Like::where('user_id', $data['user_id'])
                     ->where('post_id', $data['post_id'])
                     ->first();
        if (!$like) {
            throw new Exception('Like not found');
        }
        $like->status = $data['status'];
        return $like->save();
    }

    public function all()
    {
        return Like::all();
    }

    public function updateLike(Like $like) : Like
    {   
        $like->status = !$like->status;
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

}

