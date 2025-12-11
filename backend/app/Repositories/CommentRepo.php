<?php

namespace App\Repositories;

use App\Models\Comment;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class CommentRepo
{
    protected Comment $commentModel;

    public function __construct(Comment $commentModel)
    {
        $this->commentModel = $commentModel;
    }

    public function addCommentOfPost(array $data): Comment
    {
        try {
            $comment = $this->commentModel->create([
                'post_id' => $data['post_id'],
                'author_id' => $data['author_id'],
                'content' => $data['content'],
                'created_at' => now(),
            ]);
            return $comment;
        } catch (\Illuminate\Database\QueryException $e) {
            // Check if it's a foreign key constraint violation
            if (str_contains($e->getMessage(), 'foreign key constraint')) {
                throw new Exception('Invalid post_id or author_id - the referenced post or user does not exist');
            }
            throw $e;
        }
    }

    public function getCommentsOfPost($postId) : Collection
    {
        // Use the provided $postId (was incorrectly using $post_id) and include
        // useful fields (id, content, author info, created_at) for the client.
        // $comments = Comment::where('comments.post_id', $postId)
        //     ->leftJoin('users', 'comments.author_id', '=', 'users.id')
        //     ->select(
        //         'comments.id',
        //         'comments.content',
        //         'comments.author_id',
        //         'comments.created_at',
        //         'users.username as name',
        //         'users.image as avatar'
        //     )
        //     ->orderBy('comments.created_at', 'asc')
        //     ->get();

        $comments = Comment::where('comments.post_id', $postId)
            ->whereNull('parent_id') // Chỉ lấy comment gốc, không lấy replies
            ->with('author:id,username,image,role')
            ->with('replies.author:id,username,image,role')
            ->orderBy('created_at', 'asc')
            ->get();
            
        return $comments;
    }
}