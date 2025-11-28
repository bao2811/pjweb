<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Exception;

class PostRepo
{
    public function getPostById($id) : ?Post
    {
        // $post = DB::table('posts')->where('id', 4)->first();
        // dd($post);
        $post = Post::find($id);
        return $post;
    }

    // Backwards-compatible alias used by some services
    public function find($id) : ?Post
    {
        return $this->getPostById($id);
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

    public function updateLikeOfPost($postId, $status, $totalLikes)
    {
        $like = $totalLikes + ($status == 1 ? 1 : -1);
        $post = DB::table('posts')
            ->where('id', $postId)
            ->update(['likes' => $like]);
        return $post;
    }
}
