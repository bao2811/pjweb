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
            $table->text('description'); // Mô tả chi tiết
            $table->string('location'); // Địa điểm
            $table->date('date'); // Ngày diễn ra
            $table->time('time'); // Giờ bắt đầu
            
            // Quản lý số lượng
            $table->integer('max_participants')->default(50); // Số người tối đa
            $table->integer('current_participants')->default(0); // Số người hiện tại
            
            // Phân loại và trạng thái
            $table->string('category')->nullable(); // Loại: môi trường, giáo dục, y tế...
            $table->enum('status', [
                'pending',      // Chờ admin duyệt
                'approved',     // Đã duyệt
                'rejected',     // Bị từ chối
                'completed',    // Đã hoàn thành
                'cancelled'     // Đã hủy
            ])->default('pending');
            
            // Ẩn/hiện
            $table->boolean('is_hidden')->default(false); // Admin có thể ẩn event
            
            // Người tạo (Manager)
            $table->foreignId('organizer_id')
                  ->constrained('users')
                  ->onDelete('cascade'); // Xóa manager → xóa events của họ
            
            $table->timestamps();
            
            // Indexes để tăng tốc query
            $table->index('status'); // Thường query theo status
            $table->index('date'); // Thường query theo ngày
            $table->index('category'); // Thường filter theo category
            $table->index('organizer_id'); // Lấy events của 1 manager
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
