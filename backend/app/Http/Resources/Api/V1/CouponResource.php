<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'code'         => $this->code,
            'audience'     => $this->audience ?? 'public',
            'type'         => $this->type,
            'amount'       => (float) $this->amount,
            'max_discount' => $this->max_discount ? (float) $this->max_discount : null,
            'min_order'    => (float) $this->min_order,
            'usage_limit'  => $this->usage_limit,
            'used_count'   => $this->used_count,
            'remaining'    => $this->usage_limit ? max(0, $this->usage_limit - $this->used_count) : null,
            'is_active'    => $this->is_active,
            'is_valid'     => $this->is_valid,   // accessor
            'expires_at'   => $this->expires_at?->toIso8601String(),
            'assigned_users_count' => $this->whenCounted('users'),
            'created_at'   => $this->created_at->toIso8601String(),
        ];
    }
}
