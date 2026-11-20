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
        Schema::table('member_commodities', function (Blueprint $table) {
            $table->string('cultivation_type', 50)->nullable()->after('fish_category_id'); // Kolam tanah, Kolam terpal, Kolam beton, Keramba Jaring Apung, Tambak, Bioflok, Penangkapan
            $table->string('capacity_unit', 20)->default('ton')->after('capacity'); // kg, ton, ekor
            $table->string('production_period', 20)->default('tahun')->after('capacity_unit'); // bulan, tahun
            $table->string('land_area_unit', 20)->default('m2')->after('land_area'); // m2, ha
            $table->integer('pond_count')->nullable()->after('land_area_unit'); // Jumlah kolam (opsional)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_commodities', function (Blueprint $table) {
            $table->dropColumn([
                'cultivation_type',
                'capacity_unit',
                'production_period',
                'land_area_unit',
                'pond_count',
            ]);
        });
    }
};
