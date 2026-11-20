<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->nullableMorphs('payable');

            // Drop foreign key and unique index on order_id to make it nullable and non-unique
            $table->dropForeign(['order_id']);
            $table->dropUnique(['order_id']);
        });

        // Make order_id nullable and restore foreign key
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('order_id')->nullable()->change();
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        // Backfill existing payments to App\Models\Order
        DB::table('payments')
            ->whereNull('payable_type')
            ->whereNotNull('order_id')
            ->update([
                'payable_type' => 'App\\Models\\Order',
                'payable_id' => DB::raw('order_id'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore order_id from payable if payable_type is Order
        DB::table('payments')
            ->where('payable_type', 'App\\Models\\Order')
            ->whereNull('order_id')
            ->update([
                'order_id' => DB::raw('payable_id'),
            ]);

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropMorphs('payable');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('order_id')->nullable(false)->change();
            $table->unique('order_id');
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });
    }
};
