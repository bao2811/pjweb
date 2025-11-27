<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop constraints if they exist (using raw SQL for PostgreSQL)
        DB::statement('ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_post_id_foreign');
        DB::statement('ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_unique');
        
        Schema::table('likes', function (Blueprint $table) {
            // Cho phép post_id null
            $table->unsignedBigInteger('post_id')->nullable()->change();
            
            // Thêm cột event_id nếu chưa có
            if (!Schema::hasColumn('likes', 'event_id')) {
                $table->unsignedBigInteger('event_id')->nullable()->after('post_id');
            }
            
            // Thêm constraint mới
            $table->foreign('post_id')
                  ->references('id')->on('posts')
                  ->onDelete('cascade');
                  
            $table->foreign('event_id')
                  ->references('id')->on('events')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            if (Schema::hasColumn('likes', 'event_id')) {
                $table->dropColumn('event_id');
            }
        });
    }
};
