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
        Schema::table('join_events', function (Blueprint $table) {
            $table->boolean('completed')->default(false)->after('status');
            $table->timestamp('completion_date')->nullable()->after('completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('join_events', function (Blueprint $table) {
            $table->dropColumn(['completed', 'completion_date']);
        });
    }
};
