<?php

namespace App\Services;

use App\Repositories\PostRepo;
use App\Repositories\CommentRepo;
use App\Models\Comment;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;



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
        // Không validate ở đây - validation đã làm ở Controller
        // Chỉ set status mặc định, bỏ like/comment vì không có trong database
        $data['status'] = $data['status'] ?? 'active';

        return $this->postRepo->createPost($data);
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

    public function updatePost($id, $data)
    {
        try {
            $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'image' => 'sometimes|image|max:2048',
            ]);
            $result =  $this->postRepo->update($id, $data);
            return [
                'success' => $result,
                'message' => $result ? 'Post updated successfully' : 'Post not found'
            ];
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    public function deletePost($id)
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

    // Lấy posts theo channel_id
    public function getPostsByChannel($channelId, $userId = null)
    {
        try {
            return $this->postRepo->getPostsByChannel($channelId, $userId);
        } catch (Exception $e) {
            Log::error('Error getting posts by channel: ' . $e->getMessage());
            return [];
        }
    }

    // Thêm comment vào post
    public function addCommentOfPost(array $data)
    {
        try {
            // Validate required fields
            if (!isset($data['post_id']) || !isset($data['content'])) {
                throw new \Exception('Missing required fields: post_id and content');
            }

            // Get author_id from auth or request
            $authorId = $data['author_id'] ?? auth()->id();
            
            if (!$authorId) {
                throw new \Exception('Author ID is required');
            }

            $comment = $this->commentRepo->createComment([
                'post_id' => $data['post_id'],
                'author_id' => $authorId,
                'content' => $data['content'],
                'parent_id' => $data['parent_id'] ?? null,
            ]);

            // Load author relationship
            $comment->load('author:id,name,avatar,role');

            \Log::info('Comment created successfully:', [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'author' => $comment->author->name ?? 'Unknown'
            ]);

            return $comment;
        } catch (\Exception $e) {
            \Log::error('Error creating comment: ' . $e->getMessage());
            throw $e;
        }
    }

    // Lấy comments của post
    public function getCommentsOfPost($postId)
    {
        try {
            return $this->commentRepo->getCommentsByPost($postId);
        } catch (Exception $e) {
            Log::error('Error getting comments: ' . $e->getMessage());
            return [];
        }
    }

}