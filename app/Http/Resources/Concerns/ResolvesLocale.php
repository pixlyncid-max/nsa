<?php

namespace App\Http\Resources\Concerns;

trait ResolvesLocale
{
    /**
     * Membaca field terlokalisasi dari resource yang memakai HasAutoTranslations.
     */
    protected function tr(string $field, ?string $locale = null): mixed
    {
        if (method_exists($this->resource, 'tr')) {
            return $this->resource->tr($field, $locale);
        }

        return data_get($this->resource, $field);
    }
}
