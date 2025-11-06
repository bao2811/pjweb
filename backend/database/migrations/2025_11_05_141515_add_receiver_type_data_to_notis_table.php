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
        Schema::table('notis', function (Blueprint $table) {
            $table->unsignedBigInteger('receiver_id')->nullable()->after('sender_id');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->string('type')->default('general')->after('receiver_id');
            $table->json('data')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notis', function (Blueprint $table) {
            $table->dropForeign(['receiver_id']);
            $table->dropColumn(['receiver_id', 'type', 'data']);
        });
    }
};
