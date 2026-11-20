<?php

namespace App\Services\Translation\Drivers;

use App\Contracts\Translator;
use App\Services\Translation\TranslationPromptBuilder;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ClaudeTranslator implements Translator
{
    public function translateBatch(
        array $items,
        string $from = 'id',
        string $to = 'en',
        array $context = []
    ): array {
        $apiKey = (string) config('translation.drivers.claude.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('ANTHROPIC_API_KEY belum dikonfigurasi di .env.');
        }

        $model = (string) config('translation.drivers.claude.model', 'claude-3-5-sonnet-latest');
        $endpoint = (string) config('translation.drivers.claude.endpoint', 'https://api.anthropic.com/v1/messages');
        $timeout = (int) config('translation.drivers.claude.timeout', 45);
        $glossary = $context['glossary'] ?? [];

        $response = Http::timeout($timeout)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->post($endpoint, [
                'model' => $model,
                'max_tokens' => 4096,
                'temperature' => 0.1,
                'system' => TranslationPromptBuilder::systemPrompt($from, $to, $glossary),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ],
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Claude API gagal: HTTP '.$response->status().' '.$response->body());
        }

        $rawText = (string) ($response->json('content.0.text') ?? '');
        $cleaned = trim(preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $rawText) ?? $rawText);
        $decoded = json_decode($cleaned, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Respons Claude bukan JSON yang valid.');
        }

        $result = [];
        foreach (array_keys($items) as $key) {
            if (! array_key_exists($key, $decoded) || ! is_string($decoded[$key])) {
                throw new RuntimeException("Key [{$key}] tidak ditemukan pada respons JSON Claude.");
            }
            $result[$key] = $decoded[$key];
        }

        return $result;
    }

    public function driverName(): string
    {
        return 'claude';
    }
}
