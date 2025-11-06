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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            
            // Khóa ngoại (có thể null nếu chưa gán)
            $table->unsignedBigInteger('author_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('event_id')->nullable();
            
            $table->text('image')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->integer('like')->default(0);
            $table->integer('comment')->default(0);
            $table->boolean('status')->default(true);
            
            $table->timestamps(); // tạo created_at, updated_at

            // Các khóa ngoại (chỉ chạy nếu bạn đã có bảng users, events)
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
