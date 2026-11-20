<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_texts', function (Blueprint $table) {
            $table->id();
            $table->string('key')->index();
            $table->string('group')->index();
            $table->string('locale', 10)->default('id');
            $table->text('value')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['key', 'locale']);
        });

        Schema::create('site_text_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_text_id')->constrained('site_texts')->cascadeOnDelete();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_text_revisions');
        Schema::dropIfExists('site_texts');
    }
};
