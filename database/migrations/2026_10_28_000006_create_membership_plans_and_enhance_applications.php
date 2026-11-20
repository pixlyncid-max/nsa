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
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('benefits');
            $table->unsignedInteger('annual_fee')->default(0); // Iuran per tahun dlm rupiah
            $table->string('badge')->nullable(); // mis. Rekomendasi Utama
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::table('member_applications', function (Blueprint $table) {
            $table->foreignId('membership_plan_id')->nullable()->after('review_note')->constrained('membership_plans')->nullOnDelete();
            $table->foreignId('dpc_id')->nullable()->after('membership_plan_id')->constrained('dpcs')->nullOnDelete();
            $table->string('previous_organization')->nullable()->after('dpc_id');
            $table->string('recommender_name')->nullable()->after('previous_organization');
            $table->text('join_reason')->nullable()->after('recommender_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_applications', function (Blueprint $table) {
            $table->dropForeign(['membership_plan_id']);
            $table->dropForeign(['dpc_id']);
            $table->dropColumn([
                'membership_plan_id',
                'dpc_id',
                'previous_organization',
                'recommender_name',
                'join_reason',
            ]);
        });

        Schema::dropIfExists('membership_plans');
    }
};
