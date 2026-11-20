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
        Schema::table('member_businesses', function (Blueprint $table) {
            // Drop unique constraint on user_id to enable hasMany
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->foreignId('application_id')->nullable()->after('user_id')->constrained('member_applications')->cascadeOnDelete();
            $table->string('institution_name')->nullable()->after('name');
            $table->string('activity_field')->nullable()->after('membership_type');
            $table->integer('years_operating')->nullable()->after('founded_at');
            $table->string('scale', 50)->nullable()->after('business_scale');
            $table->text('operational_info')->nullable()->after('address');
            $table->boolean('is_primary')->default(true)->after('operational_info');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_businesses', function (Blueprint $table) {
            $table->dropForeign(['application_id']);
            $table->dropColumn([
                'application_id',
                'institution_name',
                'activity_field',
                'years_operating',
                'scale',
                'operational_info',
                'is_primary',
            ]);

            $table->dropForeign(['user_id']);
            $table->unique('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
