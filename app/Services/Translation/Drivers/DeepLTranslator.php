<?php

namespace App\Services\Translation\Drivers;

use App\Contracts\Translator;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class DeepLTranslator implements Translator
{
    public function translateBatch(
        array $items,
        string $from = 'id',
        string $to = 'en',
        array $context = []
    ): array {
        $apiKey = (string) config('translation.drivers.deepl.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('DEEPL_API_KEY belum dikonfigurasi di .env.');
        }

        $endpoint = (string) config('translation.drivers.deepl.endpoint', 'https://api-free.deepl.com/v2/translate');
        $timeout = (int) config('translation.drivers.deepl.timeout', 30);

        $keys = array_keys($items);
        $texts = array_values($items);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'Authorization' => 'DeepL-Auth-Key '.$apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($endpoint, [
                'text' => $texts,
                'source_lang' => strtoupper($from),
                'target_lang' => strtoupper($to) === 'EN' ? 'EN-US' : strtoupper($to),
                'tag_handling' => 'html',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('DeepL API gagal: HTTP '.$response->status().' '.$response->body());
        }

        $translations = $response->json('translations', []);
        if (! is_array($translations) || count($translations) !== count($keys)) {
            throw new RuntimeException('Jumlah hasil terjemahan DeepL tidak sesuai.');
        }

        $result = [];
        foreach ($keys as $index => $key) {
            $result[$key] = (string) ($translations[$index]['text'] ?? '');
        }

        return $result;
    }

    public function driverName(): string
    {
        return 'deepl';
    }
}
