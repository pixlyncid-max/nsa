<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TranslationUsageDaily extends Model
{
    protected $table = 'translation_usage_daily';

    protected $fillable = [
        'provider',
        'date',
        'chars',
        'requests',
    ];

    protected function casts(): array
    {
        return [
            'chars' => 'integer',
            'requests' => 'integer',
        ];
    }

    public static function recordUsage(string $provider, int $chars, int $requests = 1): void
    {
        $today = now()->toDateString();

        $record = static::query()->firstOrCreate(
            ['provider' => $provider, 'date' => $today],
            ['chars' => 0, 'requests' => 0]
        );

        static::query()
            ->where('id', $record->id)
            ->update([
                'chars' => DB::raw('chars + '.max(0, $chars)),
                'requests' => DB::raw('requests + '.max(0, $requests)),
                'updated_at' => now(),
            ]);
    }

    public static function todayChars(?string $provider = null): int
    {
        $query = static::query()->where('date', now()->toDateString());
        if ($provider !== null) {
            $query->where('provider', $provider);
        }

        return (int) $query->sum('chars');
    }
}
