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
}