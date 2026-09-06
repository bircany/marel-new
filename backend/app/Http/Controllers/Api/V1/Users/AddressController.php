<?php

namespace App\Http\Controllers\Api\V1\Users;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success($request->user()->addresses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:80',
            'name'         => 'required|string|max:150',
            'phone'        => 'required|string|max:20',
            'city'         => 'required|string|max:80',
            'district'     => 'required|string|max:80',
            'neighborhood' => 'nullable|string|max:100',
            'full_address' => 'required|string',
            'zip_code'     => 'nullable|string|max:10',
            'is_default'   => 'boolean',
        ]);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($data);
        return $this->created($address, 'Adres eklendi.');
    }

    public function show(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        return $this->success($address);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        $data = $request->validate([
            'title'        => 'sometimes|string|max:80',
            'name'         => 'sometimes|string|max:150',
            'phone'        => 'sometimes|string|max:20',
            'city'         => 'sometimes|string|max:80',
            'district'     => 'sometimes|string|max:80',
            'neighborhood' => 'nullable|string|max:100',
            'full_address' => 'sometimes|string',
            'zip_code'     => 'nullable|string|max:10',
            'is_default'   => 'boolean',
        ]);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address->update($data);
        return $this->success($address, 'Adres güncellendi.');
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        $address->delete();
        return $this->noContent();
    }
}
