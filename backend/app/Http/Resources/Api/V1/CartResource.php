<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CartResource extends ResourceCollection
{
    private float $subtotal;

    public function __construct($resource)
    {
        parent::__construct($resource);

        $this->subtotal = $resource->sum(function ($item) {
            $unitPrice = $item->unit_price_snapshot !== null
                ? (float) $item->unit_price_snapshot
                : (((float) ($item->product?->current_price ?? 0))
                    + ($item->variant?->id ? (float) $item->variant->price_modifier : 0.0));

            return round($unitPrice * $item->quantity, 2);
        });
    }

    public function toArray(Request $request): array
    {
        return [
            'items' => CartItemResource::collection($this->collection),
            'summary' => [
                'item_count' => $this->collection->count(),
                'total_quantity' => $this->collection->sum('quantity'),
                'subtotal' => round($this->subtotal, 2),
                'formatted_subtotal' => number_format($this->subtotal, 2, ',', '.') . ' ?',
            ],
        ];
    }
}
