<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedBigInteger('event_id')->nullable();
            $table->timestamps();

            // Khóa ngoại liên kết với event
            // $table->foreign('event_id')
            //       ->references('id')
            //       ->on('events')
            //       ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
