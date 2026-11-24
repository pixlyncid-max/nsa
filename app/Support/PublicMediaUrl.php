<?php

namespace App\Support;

class PublicMediaUrl
{
    public static function resolve(?string $path): ?string
    {
        if (! is_string($path) || trim($path) === '') {
            return null;
        }

        $trimmed = trim($path);
        if (
            str_starts_with($trimmed, 'http://')
            || str_starts_with($trimmed, 'https://')
            || str_starts_with($trimmed, '/')
        ) {
            return $trimmed;
        }

        return '/storage/'.ltrim($trimmed, '/');
    }
}
