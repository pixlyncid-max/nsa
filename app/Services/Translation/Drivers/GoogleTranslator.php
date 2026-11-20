<?php

namespace App\Services\Translation\Drivers;

use App\Contracts\Translator;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleTranslator implements Translator
{
    public function translateBatch(
        array $items,
        string $from = 'id',
        string $to = 'en',
        array $context = []
    ): array {
        $apiKey = (string) config('translation.drivers.google.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('GOOGLE_TRANSLATE_API_KEY belum dikonfigurasi di .env.');
        }

        $endpoint = (string) config('translation.drivers.google.endpoint', 'https://translation.googleapis.com/language/translate/v2');
        $timeout = (int) config('translation.drivers.google.timeout', 30);

        $keys = array_keys($items);
        $texts = array_values($items);

        $response = Http::timeout($timeout)
            ->post($endpoint.'?key='.urlencode($apiKey), [
                'q' => $texts,
                'source' => $from,
                'target' => $to,
                'format' => 'html',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Google Translate API gagal: HTTP '.$response->status().' '.$response->body());
        }

        $translations = $response->json('data.translations', []);
        if (! is_array($translations) || count($translations) !== count($keys)) {
            throw new RuntimeException('Jumlah hasil terjemahan Google Translate tidak sesuai.');
        }

        $result = [];
        foreach ($keys as $index => $key) {
            $result[$key] = html_entity_decode(
                (string) ($translations[$index]['translatedText'] ?? ''),
                ENT_QUOTES | ENT_HTML5,
                'UTF-8'
            );
        }

        return $result;
    }

    public function driverName(): string
    {
        return 'google';
    }
}
