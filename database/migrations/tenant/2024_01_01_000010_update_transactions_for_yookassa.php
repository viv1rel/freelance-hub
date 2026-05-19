<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('yookassa_payment_id')->nullable()->after('invoice_id');
            $table->index('yookassa_payment_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['yookassa_payment_id']);
            $table->dropColumn('yookassa_payment_id');
        });
    }
};
