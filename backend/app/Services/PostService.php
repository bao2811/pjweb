<?php

namespace App\Services;

use App\Repositories\PostRepo;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Repositories\CommentRepo;
use App\Models\Post;

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

    public function getAllPosts($currentUserId, $lastId = null, $limit = 20)
    {
        try {
            return $this->postRepo->all($currentUserId, $lastId, $limit);
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

    public function updateLikeOfPost($postId, $status = 1): bool
    {   
        try {

            $post = $this->getPostById($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }
            $post->likes = ($post->likes ?? 0) + $status;
            $post->save();
            return true;
        } catch (Exception $e) {
            // Handle exception
            return false;
        }
    }

    public function addCommentOfPost($postId, $userId, $content)
    {
        $content = trim($content);
        if ($content === '') {
            throw new Exception('Content cannot be empty');
        }
        // $comment = $this->commentRepo->addCommentOfPost([
        //         'post_id' => $postId,
        //         'author_id' => $userId,
        //         'content'  => $content
        //     ]);
        // return $comment;
        DB::beginTransaction();
        try {
            $comment = $this->commentRepo->addCommentOfPost([
                'post_id' => $postId,
                'author_id' => $userId,
                'content'  => $content
            ]);

            $post = $this->getPostById($postId);
            if (!$post) {
                throw new Exception('Post not found');
            }

            $post->comments += 1;
            $post->save();

            DB::commit();

            return $comment; // Sửa đúng biến
        } catch (Exception $e) {
            DB::rollBack();
            return null;
        }
    }


    public function getCommentsOfPost($postId)
    {
        try {
            return $this->commentRepo->getCommentsOfPost($postId);
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

    public function getPostsByChannel($channelId)
    {
        try {
            return $this->postRepo->getPostsByChannel($channelId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    // Thêm comment vào post
    // public function addCommentOfPost(array $data)
    // {
    //     try {
    //         // Validate required fields
    //         if (!isset($data['post_id']) || !isset($data['content'])) {
    //             throw new \Exception('Missing required fields: post_id and content');
    //         }

    //         // Get author_id from auth or request
    //         $authorId = $data['author_id'] ?? auth()->id();
            
    //         if (!$authorId) {
    //             throw new \Exception('Author ID is required');
    //         }

    //         $comment = $this->commentRepo->createComment([
    //             'post_id' => $data['post_id'],
    //             'author_id' => $authorId,
    //             'content' => $data['content'],
    //             'parent_id' => $data['parent_id'] ?? null,
    //         ]);

    //         // Load author relationship
    //         $comment->load('author:id,name,avatar,role');

    //         \Log::info('Comment created successfully:', [
    //             'comment_id' => $comment->id,
    //             'post_id' => $comment->post_id,
    //             'author' => $comment->author->name ?? 'Unknown'
    //         ]);

    //         return $comment;
    //     } catch (\Exception $e) {
    //         \Log::error('Error creating comment: ' . $e->getMessage());
    //         throw $e;
    //     }
    // }
}