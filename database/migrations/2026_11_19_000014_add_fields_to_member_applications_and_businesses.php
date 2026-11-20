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
        Schema::table('member_applications', function (Blueprint $table) {
            $table->string('membership_category_custom', 150)->nullable()->after('membership_category');
            $table->string('institution_name', 255)->nullable()->after('applicant_type');
            $table->string('applicant_position', 150)->nullable()->after('institution_name');
        });

        Schema::table('member_businesses', function (Blueprint $table) {
            $table->boolean('has_no_business')->default(false)->after('is_primary');
            $table->string('main_job', 255)->nullable()->after('has_no_business');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_businesses', function (Blueprint $table) {
            $table->dropColumn(['has_no_business', 'main_job']);
        });

        Schema::table('member_applications', function (Blueprint $table) {
            $table->dropColumn([
                'membership_category_custom',
                'institution_name',
                'applicant_position',
            ]);
        });
    }
};
