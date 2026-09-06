<?php

namespace App\Repositories;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository
{
    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with('items')
                    ->forUser($userId)
                    ->latest()
                    ->paginate($perPage);
    }

    public function paginateAll(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        return Order::with('user')
                    ->when($filters['status'] ?? null, fn ($q, $v) => $q->byStatus($v))
                    ->latest()
                    ->paginate($perPage);
    }
}
