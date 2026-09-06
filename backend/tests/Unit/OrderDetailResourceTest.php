<?php

namespace Tests\Unit;

use App\Http\Resources\Api\V1\OrderDetailResource;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tests\TestCase;

class OrderDetailResourceTest extends TestCase
{
    public function test_resource_includes_backward_compatible_and_formatted_fields(): void
    {
        $now = Carbon::parse('2026-03-14 12:00:00');

        $order = new Order([
            'id' => 10,
            'order_number' => 'ORD-20260314-00010',
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'credit_card',
            'subtotal' => 1000,
            'discount_amount' => 125.5,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'total' => 874.5,
            'shipping_address' => [
                'name' => 'Test User',
                'phone' => '5551112233',
                'city' => 'Istanbul',
                'district' => 'Kadikoy',
                'full_address' => 'Sample Address',
            ],
            'billing_address' => [
                'name' => 'Test User',
                'phone' => '5551112233',
                'city' => 'Istanbul',
                'district' => 'Kadikoy',
                'full_address' => 'Sample Address',
            ],
            'notes' => 'Test note',
        ]);
        $order->created_at = $now;
        $order->updated_at = $now;

        $order->setRelation('items', collect([
            new OrderItem(['quantity' => 2]),
            new OrderItem(['quantity' => 1]),
        ]));
        $order->setRelation('coupon', new Coupon([
            'id' => 1,
            'code' => 'TEST10',
            'type' => 'percent',
            'amount' => 10,
        ]));

        $payload = (new OrderDetailResource($order))->toArray(Request::create('/api/v1/orders/10', 'GET'));

        $this->assertSame('1.000,00 TL', $payload['formatted_subtotal']);
        $this->assertSame('125,50 TL', $payload['formatted_discount']);
        $this->assertSame($payload['shipping_address'], $payload['address']);
        $this->assertSame(3, $payload['item_count']);
    }
}
