<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TranslationGlossary extends Model
{
    use HasFactory;

    protected $table = 'translation_glossary';

    protected $fillable = [
        'source',
        'target',
        'locale',
        'note',
        'case_sensitive',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'case_sensitive' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
