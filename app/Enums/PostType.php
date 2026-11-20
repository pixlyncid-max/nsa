<?php

namespace App\Enums;

enum PostType: string
{
    case News = 'news';
    case Article = 'article';

    public function label(): string
    {
        return match ($this) {
            self::News => 'Berita',
            self::Article => 'Artikel',
        };
    }
}
