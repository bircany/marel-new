<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        $user  = User::create($data + ['role' => 'user']);
        $token = $user->createToken($data['device_name'] ?? 'api')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function login(array $credentials): ?array
    {
        if (! Auth::attempt($credentials)) {
            return null;
        }

        /** @var User $user */
        $user  = Auth::user();
        $token = $user->createToken($credentials['device_name'] ?? 'api')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
