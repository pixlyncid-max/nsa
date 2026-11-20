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
        Schema::table('member_statements', function (Blueprint $table) {
            $table->string('city')->nullable()->after('user_id');
            $table->boolean('agree_data_accurate')->default(false)->after('city');
            $table->boolean('agree_ad_art')->default(false)->after('agree_data_accurate');
            $table->boolean('agree_privacy_policy')->default(false)->after('agree_ad_art');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_statements', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'agree_data_accurate',
                'agree_ad_art',
                'agree_privacy_policy',
            ]);
        });
    }
};
