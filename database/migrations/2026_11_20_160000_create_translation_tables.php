<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_glossary', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('target');
            $table->string('locale', 10)->default('en');
            $table->string('note')->nullable();
            $table->boolean('case_sensitive')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['source', 'locale'], 'tg_unique_source_locale');
            $table->index(['locale', 'is_active'], 'tg_locale_active_idx');
        });

        Schema::create('content_translations', function (Blueprint $table) {
            $table->id();
            $table->string('translatable_type');
            $table->unsignedBigInteger('translatable_id');
            $table->string('field');
            $table->string('locale', 10);
            $table->longText('value')->nullable();
            $table->string('source_hash', 64);
            $table->string('status', 20)->default('pending')->index();
            $table->boolean('is_manual')->default(false);
            $table->string('provider', 50)->nullable();
            $table->unsignedInteger('chars')->default(0);
            $table->text('error')->nullable();
            $table->timestamp('translated_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['translatable_type', 'translatable_id', 'field', 'locale'],
                'ct_unique_entity_field_locale'
            );
            $table->index(
                ['translatable_type', 'translatable_id', 'locale'],
                'ct_entity_locale_idx'
            );
        });

        Schema::create('translation_usage_daily', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50);
            $table->date('date');
            $table->unsignedBigInteger('chars')->default(0);
            $table->unsignedInteger('requests')->default(0);
            $table->timestamps();

            $table->unique(['provider', 'date'], 'tud_provider_date_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_usage_daily');
        Schema::dropIfExists('content_translations');
        Schema::dropIfExists('translation_glossary');
    }
};
