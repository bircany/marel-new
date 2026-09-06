<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'name',
        'phone',
        'city',
        'district',
        'neighborhood',
        'full_address',
        'zip_code',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
