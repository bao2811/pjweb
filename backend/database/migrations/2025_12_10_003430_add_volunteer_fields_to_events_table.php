<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Thêm các cột cho hệ thống tình nguyện
            $table->text('description')->nullable()->after('title');
            $table->string('location')->nullable()->after('address');
            $table->string('category', 100)->nullable()->after('status');
            $table->integer('max_participants')->default(50)->after('category');
            $table->integer('current_participants')->default(0)->after('max_participants');
            $table->integer('points')->default(100)->after('current_participants');
            $table->unsignedBigInteger('creator_id')->nullable()->after('author_id');
            
            // Thêm foreign key cho creator_id
            $table->foreign('creator_id')
                  ->references('id')->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['creator_id']);
            $table->dropColumn([
                'description',
                'location', 
                'category',
                'max_participants',
                'current_participants',
                'points',
                'creator_id'
            ]);
        });
    }
};
