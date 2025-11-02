<?php

namespace App\Services;

use App\Repositories\PostRepo;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Repositories\CommentRepo;

class PostService
{
    protected $postRepo;
    protected $commentRepo;

    public function __construct(PostRepo $postRepo, CommentRepo $commentRepo)
    {
        $this->postRepo = $postRepo;
        $this->commentRepo = $commentRepo;
    }       

    public function getPostById($id)
    {
        try {
            return $this->postRepo->find($id);
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function createPost($data)
    {
        try {
            $data->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'image' => 'sometimes|image|max:2048',
                'user_id' => 'required|integer|exists:users,id',
                'event_id' => 'sometimes|integer|exists:events,id',
            ]);
            
            $data['like'] = 0;
            $data['comment'] = 0;
            $data['status'] = 1;

            return $this->postRepo->createPost($data);
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function getAllPosts()
    {
        try {
            return $this->postRepo->all();
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    public function updatePostById($id, $data)
    {
        try {
            $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'image' => 'sometimes|image|max:2048',
            ]);
            $result =  $this->postRepo->updatePostById($id, $data);
            return [
                'success' => $result,
                'message' => $result ? 'Post updated successfully' : 'Post not found'
            ];
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function deletePostById($id)
    {
        try {
            $result =  $this->postRepo->deletePostById($id);
            return [
                'success' => $result,
                'message' => $result ? 'Post deleted successfully' : 'Post not found'
            ];
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function searchPosts($query)
    {
        try {
            return $this->postRepo->searchPost($query);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    public function updateLikeOfPost($postId, $status)
    {   
        try {
            $post = $this->postRepo->find($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }
            $post->like_count += $status;
            $post->save();

            return $post;
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function addCommentOfPost($postId, $data)
    {
        try {
            $data->validate([
                'user_id' => 'required|integer|exists:users,id',
                'content' => 'required|string',
            ]);
            DB::beginTransaction();
            $comment = $this->commentRepo->addCommentOfPost(array_merge($data, ['post_id' => $postId]));
            $post = $this->postRepo->find($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }
            $post->comment_count += 1;
            $post->save();
            DB::commit();
            return $post;
        } catch (Exception $e) {
            DB::rollBack();
            // Handle exception
            return null;
        }
    }

    public function getCommentsOfPost($postId)
    {
        try {
            return $this->commentRepo->getCommentsByPostId($postId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    public function getLikesOfPost($postId)
    {
        try {
            return $this->postRepo->getLikesByPostId($postId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    public function getPostsByUserId($userId)
    {
        try {
            return $this->postRepo->getPostsByUserId($userId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    public function getPostsByEventId($eventId)
    {
        try {
            return $this->postRepo->getPostsByEventId($eventId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }
}