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
        // return User::select('users.*', \DB::raw('COUNT(join_events.event_id) as events_count'))
        //     ->leftJoin('join_events', 'users.id', '=', 'join_events.user_id')
        //     ->where('users.role', 'user')
        //     ->groupBy('users.id')
        //     ->get();

        return User::where('role', 'user')
            ->withCount(['joinEvents as events_count']) // tính số lượng event tham gia
            ->get();
    }

    public function findByEmail($email)
    {
        return User::where('email', $email)->first();
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

    public function find($id) : ?User
    {
        $user = $this->getUserById($id);
        return $user;
    }

    public function banUser($id): int
    {
        $result = User::where('id', $id)->update(['status' => 'locked']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
    }

    public function unbanUser($id) : int
    {
        $result = User::where('id', $id)->update(['status' => 'active']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
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