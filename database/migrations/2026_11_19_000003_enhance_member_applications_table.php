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
            $table->string('membership_category', 100)->nullable()->after('status');
            $table->string('applicant_type', 30)->default('individual')->after('membership_category'); // individual | institution
            $table->foreignId('membership_type_id')->nullable()->after('applicant_type')->constrained('membership_types')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_applications', function (Blueprint $table) {
            $table->dropForeign(['membership_type_id']);
            $table->dropColumn([
                'membership_category',
                'applicant_type',
                'membership_type_id',
            ]);
        });
    }
};
