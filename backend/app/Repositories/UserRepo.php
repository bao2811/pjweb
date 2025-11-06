<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;


class UserRepo
{
    public function getUserByEmail($email)
    {
        return User::where('email', $email)->first();
    }

    public function getUserById($id) : ?User
    {
        return User::find($id);
    }

    public function createUser($data) : User
    {
        return User::create($data);
    }

    public function getAllUsers()
    {
        return User::where('role', 'user')->get();
    }

    public function getUsersByRole($role)
    {
        return User::where('role', $role)->get();
    }

    public function updateUserById($id, $data) : User
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        $user->update($data);
        return $user;
    }

    public function banUser($id) : User
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        $user->is_banned = true;
        $user->save();
        return $user;
    }

    public function unbanUser($id) : User
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        $user->is_banned = false;
        $user->save();
        return $user;
    }

    public function deleteUserById($id) : bool
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        return $user->delete();
    }
}