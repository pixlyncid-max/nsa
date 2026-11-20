<?php

namespace App\Models;

use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['title'];

    /** @var list<string> */
    protected array $translatableJson = ['body'];

    protected $fillable = [
        'slug',
        'title',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'body' => 'array',
        ];
    }
}
