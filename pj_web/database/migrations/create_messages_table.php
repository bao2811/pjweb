<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');     // id của người gửi
            $table->unsignedBigInteger('channel_id');    // id của kênh / phòng chat
            $table->text('content');                     // nội dung tin nhắn
            $table->timestamp('sent_at')->useCurrent();  // thời điểm gửi
            $table->timestamps();

            // Nếu có bảng users và channels, thêm khóa ngoại:
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('channel_id')->references('id')->on('channels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
