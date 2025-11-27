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
        return $this->commentModel->create($data);
    }

    public function createComment(array $data): Comment
    {
        return $this->commentModel->create($data);
    }

    public function getCommentsByPost($postId)
    {
        return $this->commentModel
            ->where('post_id', $postId)
            ->whereNull('parent_id') // Chỉ lấy comment gốc, không lấy replies
            ->with('author:id,name,avatar,role')
            ->with('replies.author:id,name,avatar,role')
            ->orderBy('created_at', 'asc')
            ->get();
    }
}