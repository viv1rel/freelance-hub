<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Ссылка на users.id в ЦЕНТРАЛЬНОЙ БД — без FK (cross-database).
            // Связывает Client с User, чтобы тот видел только свои счета.
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
