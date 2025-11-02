<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Exception;

class PostRepo
{
    public function getPostById($id)
    {
        return Post::find($id);
    }

    public function createPost($data) : Post
    {
        return Post::create($data);
    }

    public function updatePostById($id, $data) : Post
    {
        $post = $this->getPostById($id);
        if (!$post) {
            throw new Exception('Post not found');
        }
        $post->update($data);
        return $post;
    }

    public function all()
    {
        return Post::all();
    }

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

    public function searchPost($query)
    {
        return Post::where('title', 'LIKE', "%$query%")
                    ->orWhere('content', 'LIKE', "%$query%")
                    ->get();
    }

    public function updateAmountLikes($eventId, $status)
    {
        $posts = Post::where('event_id', $eventId)->get();
        foreach ($posts as $post) {
            $post->like = $post->like + ($status == 1 ? 1 : -1);
            $post->save();
        }
    }

    public function getPostsByUserId($userId)
    {
        return Post::where('user_id', $userId)->get();
    }


    public function getPostsByEventId($eventId)
    {
        return Post::where('event_id', $eventId)->get();
    }

}
