<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model EventManagement - Quản lý đồng quản lý sự kiện
 * 
 * Model này đại diện cho bảng event_managements trong database,
 * lưu trữ thông tin về các đồng quản lý (comanager) được phân công
 * quản lý sự kiện cùng với người tạo.
 * 
 * @package App\Models
 */
class EventManagement extends Model
{
    use HasFactory;

    /**
     * Tên bảng trong database
     */
    protected $table = 'event_managements';

    /**
     * Các trường được phép gán hàng loạt
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'role', // Vai trò: 'captain', 'participant', v.v.
    ];
}