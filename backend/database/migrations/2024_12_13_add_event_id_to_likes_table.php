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
        Schema::table('likes', function (Blueprint $table) {
            // Thêm cột event_id (nullable vì có thể like post hoặc event)
            $table->unsignedBigInteger('event_id')->nullable()->after('post_id');
            
            // Thêm foreign key constraint
            $table->foreign('event_id')
                  ->references('id')->on('events')
                  ->onDelete('cascade');
            
            // Drop unique constraint cũ (user_id, post_id)
            $table->dropUnique(['user_id', 'post_id']);
            
            // Thêm unique constraint mới: 
            // - Một user chỉ có 1 like cho mỗi post
            // - Một user chỉ có 1 like cho mỗi event
            // Sử dụng raw SQL để tạo partial unique index
        });
        
        // Tạo unique constraint có điều kiện bằng raw SQL
        DB::statement('CREATE UNIQUE INDEX likes_user_post_unique ON likes(user_id, post_id) WHERE post_id IS NOT NULL');
        DB::statement('CREATE UNIQUE INDEX likes_user_event_unique ON likes(user_id, event_id) WHERE event_id IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            // Drop các index được tạo bằng raw SQL
            DB::statement('DROP INDEX IF EXISTS likes_user_post_unique');
            DB::statement('DROP INDEX IF EXISTS likes_user_event_unique');
            
            // Drop foreign key và column
            $table->dropForeign(['event_id']);
            $table->dropColumn('event_id');
            
            // Recreate unique constraint cũ
            $table->unique(['user_id', 'post_id']);
        });
    }
};
