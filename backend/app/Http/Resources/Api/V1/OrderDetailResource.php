<?php

namespace App\Http\Resources\Api\V1;

use App\Services\CargoTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Sipariş detay resource — kalemler, adres snapshot ve kupon dahil.
 */
class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CargoTrackingService $cargo */
        $cargo = app(CargoTrackingService::class);

        return [
            'id'              => $this->id,
            'order_number'    => $this->order_number,
            'status'          => $this->status,
            'payment_status'  => $this->payment_status,
            'payment_method'  => $this->payment_method,

            // Fiyat özeti
            'subtotal'        => (float) $this->subtotal,
            'formatted_subtotal' => number_format((float) $this->subtotal, 2, ',', '.') . ' TL',
            'discount_amount' => (float) $this->discount_amount,
            'formatted_discount' => number_format((float) $this->discount_amount, 2, ',', '.') . ' TL',
            'shipping_cost'   => (float) $this->shipping_cost,
            'tax_amount'      => (float) $this->tax_amount,
            'total'           => (float) $this->total,
            'formatted_total' => $this->formatted_total,
            'item_count'      => (int) $this->whenLoaded('items', fn () => $this->items->sum('quantity')),

            // Adres snapshot (JSON sütundan)
            'address' => $this->shipping_address, // backward compatibility
            'shipping_address'=> $this->shipping_address,
            'billing_address' => $this->billing_address,

            // Kupon
            'coupon'          => $this->when(
                $this->resource->relationLoaded('coupon') && $this->coupon?->id,
                fn () => [
                    'code'   => $this->coupon->code,
                    'type'   => $this->coupon->type,
                    'amount' => (float) $this->coupon->amount,
                ]
            ),

            // Kalemler
            'items'           => OrderItemResource::collection(
                $this->whenLoaded('items')
            ),

            // Kargo + ölçü
            'cargo_company'   => $this->cargo_company,
            'cargo_company_label' => $this->cargo_company
                ? $cargo->companyLabel($this->cargo_company)
                : null,
            'tracking_number' => $this->tracking_number,
            'tracking_url'    => $cargo->trackingUrl($this->cargo_company, $this->tracking_number),
            'shipped_at'      => $this->shipped_at?->toIso8601String(),
            'delivered_at'    => $this->delivered_at?->toIso8601String(),
            'measurement_confirmed_at' => $this->measurement_confirmed_at?->toIso8601String(),
            'measurement_notes' => $this->measurement_notes,
            'guest_email' => $this->guest_email,
            'is_guest' => $this->user_id === null,

            'notes'           => $this->notes,
            'is_cancellable'  => $this->is_cancellable,

            'created_at'      => $this->created_at->toIso8601String(),
            'updated_at'      => $this->updated_at->toIso8601String(),
        ];
    }
}
