<?php

namespace App\Models;

use App\Support\PublicMediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'path',
        'order',
    ];

    public function url(): ?string
    {
        return PublicMediaUrl::resolve($this->path);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->url();
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
