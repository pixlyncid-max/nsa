<?php

namespace App\Models;

use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DppMember extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['position', 'bio'];

    protected $fillable = [
        'name',
        'position',
        'photo',
        'order',
        'period',
        'bio',
    ];
}
