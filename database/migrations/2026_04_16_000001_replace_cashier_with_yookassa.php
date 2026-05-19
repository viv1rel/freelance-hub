<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Сначала уносим индекс — SQLite требует, чтобы индекс был дропнут до колонки.
        if (Schema::hasIndex('users', 'users_stripe_id_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_stripe_id_index');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $columns = ['stripe_id', 'pm_type', 'pm_last_four', 'trial_ends_at'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::dropIfExists('subscription_items');
        Schema::dropIfExists('subscriptions');

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan')->default('free'); // free | pro
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->string('yookassa_payment_id')->nullable();
            $table->string('yookassa_payment_method_id')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
