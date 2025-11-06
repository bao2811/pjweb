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
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->text('endpoint'); // Push subscription endpoint
            $table->string('p256dh'); // Public key for encryption
            $table->string('auth'); // Auth secret for encryption
            $table->string('device_name')->nullable(); // Thiết bị của user (Chrome, Firefox, etc.)
            
            $table->timestamps();
            
            // Unique constraint: một user có thể có nhiều thiết bị, nhưng mỗi endpoint phải unique
            $table->unique(['user_id', 'endpoint']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
