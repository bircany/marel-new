<?php

namespace App\Http\Resources\Api\V1;

use App\Services\CargoTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Sipariş listesi için kısa resource.
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CargoTrackingService $cargo */
        $cargo = app(CargoTrackingService::class);

        return [
            'id'             => $this->id,
            'order_number'   => $this->order_number,
            'status'         => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'subtotal'       => (float) $this->subtotal,
            'discount_amount'=> (float) $this->discount_amount,
            'shipping_cost'  => (float) $this->shipping_cost,
            'total'          => (float) $this->total,
            'formatted_total'=> $this->formatted_total,
            'cargo_company'  => $this->cargo_company,
            'cargo_company_label' => $this->cargo_company
                ? $cargo->companyLabel($this->cargo_company)
                : null,
            'tracking_number'=> $this->tracking_number,
            'tracking_url'   => $cargo->trackingUrl($this->cargo_company, $this->tracking_number),
            'item_count'     => $this->when(
                $this->resource->relationLoaded('items'),
                fn () => $this->items->count()
            ),
            'user' => $this->when(
                $this->resource->relationLoaded('user') && $this->user,
                fn () => [
                    'id' => $this->user->id,
                    'full_name' => $this->user->full_name ?? trim(($this->user->first_name ?? '').' '.($this->user->last_name ?? '')),
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ]
            ),
            'created_at'     => $this->created_at->toIso8601String(),
        ];
    }
}
