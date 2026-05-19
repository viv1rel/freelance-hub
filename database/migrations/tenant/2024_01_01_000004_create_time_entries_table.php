<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_running')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'project_id']);
            $table->index(['user_id', 'is_running']);
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_entries');
    }
};
