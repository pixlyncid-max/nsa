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
            if (! Schema::hasColumn('member_businesses', 'membership_type_other')) {
                $table->string('membership_type_other')->nullable()->after('membership_type');
            }
            if (! Schema::hasColumn('member_businesses', 'business_field_other')) {
                $table->string('business_field_other')->nullable()->after('business_scale');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_businesses', function (Blueprint $table) {
            if (Schema::hasColumn('member_businesses', 'business_field_other')) {
                $table->dropColumn('business_field_other');
            }
            if (Schema::hasColumn('member_businesses', 'membership_type_other')) {
                $table->dropColumn('membership_type_other');
            }
        });
    }
};
