<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('endpoint');
            $table->string('p256dh', 255)->nullable();
            $table->string('auth', 255)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('endpoint', 'idx_endpoint');
        });
    }

    public function down()
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
