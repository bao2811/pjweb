<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            
            // Thông tin cơ bản
            $table->string('title'); // Tên sự kiện
            $table->text('content')->nullable(); // Nội dung chi tiết
            $table->string('image')->nullable(); // Ảnh sự kiện
            $table->string('address'); // Địa điểm
            $table->timestamp('start_time')->nullable(); // Thời gian bắt đầu
            $table->timestamp('end_time')->nullable(); // Thời gian kết thúc
            
            // Người tạo
            $table->foreignId('author_id')
                  ->constrained('users')
                  ->onDelete('cascade'); // Xóa user → xóa events của họ
            
            // Trạng thái
            $table->string('status', 50)->default('upcoming'); // upcoming/completed/cancelled
            
            $table->timestamps();
            
            // Indexes để tăng tốc query
            $table->index('status');
            $table->index('start_time');
            $table->index('author_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
