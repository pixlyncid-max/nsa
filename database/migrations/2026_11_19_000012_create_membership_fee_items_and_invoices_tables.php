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
        Schema::create('membership_fee_items', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('type', 30)->default('required')->index(); // required | optional | recurring
            $table->boolean('has_size_option')->default(false);
            $table->json('size_options')->nullable(); // e.g. ["S", "M", "L", "XL", "XXL"]
            $table->boolean('is_active')->default(true)->index();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('member_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->string('number', 60)->unique()->index();
            $table->string('status', 30)->default('unpaid')->index(); // unpaid | waiting_confirmation | paid | rejected
            $table->decimal('total', 12, 2)->default(0);
            $table->dateTime('due_at')->nullable();
            $table->timestamps();
        });

        Schema::create('member_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('member_invoices')->cascadeOnDelete();
            $table->foreignId('fee_item_id')->nullable()->constrained('membership_fee_items')->nullOnDelete();
            $table->string('name_snapshot');
            $table->decimal('amount_snapshot', 12, 2);
            $table->unsignedInteger('qty')->default(1);
            $table->string('size', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_invoice_items');
        Schema::dropIfExists('member_invoices');
        Schema::dropIfExists('membership_fee_items');
    }
};
