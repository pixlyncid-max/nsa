<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_texts', function (Blueprint $table) {
            $table->boolean('is_manual')->default(false)->after('value');
            $table->string('translation_status', 20)->nullable()->after('is_manual');
            $table->string('source_hash', 64)->nullable()->after('translation_status');
            $table->text('translation_error')->nullable()->after('source_hash');
            $table->timestamp('translated_at')->nullable()->after('translation_error');
        });

        Schema::table('site_text_revisions', function (Blueprint $table) {
            $table->string('locale', 10)->default('id')->after('site_text_id');
        });
    }

    public function down(): void
    {
        Schema::table('site_text_revisions', function (Blueprint $table) {
            $table->dropColumn('locale');
        });

        Schema::table('site_texts', function (Blueprint $table) {
            $table->dropColumn([
                'is_manual',
                'translation_status',
                'source_hash',
                'translation_error',
                'translated_at',
            ]);
        });
    }
};
