<?php

namespace App\Service;

use App\Repositories\PostRepo;
use Exception;

class PostService
{
    protected $postRepo;

    public function __construct(PostRepo $postRepo)
    {
        $this->postRepo = $postRepo;
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

}