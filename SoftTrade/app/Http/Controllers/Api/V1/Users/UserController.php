<?php

namespace App\Http\Controllers\Api\V1\Users;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load('addresses')));
    }

    public function update(Request $request): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();

            if (!$user) {
                return $this->error('Kullanici oturumu bulunamadi. Lutfen tekrar giris yapin.', 401);
            }

            $request->validate([
                'current_password' => 'required|current_password',
                'first_name' => 'sometimes|string|max:100',
                'last_name' => 'sometimes|string|max:100',
                'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
            ], [
                'current_password.required' => 'Profil guncellemek icin mevcut sifrenizi giriniz.',
                'current_password.current_password' => 'Mevcut sifreniz hatali.',
                'phone.unique' => 'Bu telefon numarasi baska bir hesapta kullaniliyor.',
            ]);

            $data = $request->only(['first_name', 'last_name', 'phone']);
            $user->update($data);

            return $this->success(new UserResource($user->fresh()), 'Profil bilgileriniz basariyla guncellendi.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Dogrulama hatasi.', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->error('Profil guncellenirken bir hata olustu: ' . $e->getMessage(), 500);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate(
            [
                'current_password' => 'required|current_password',
                'password' => 'required|string|min:8|confirmed',
            ],
            [
                'current_password.required' => 'Mevcut sifre alani zorunludur.',
                'current_password.current_password' => 'Mevcut sifre hatali.',
                'password.required' => 'Yeni sifre alani zorunludur.',
                'password.min' => 'Yeni sifre en az 8 karakter olmalidir.',
                'password.confirmed' => 'Yeni sifre tekrari eslesmiyor.',
            ]
        );

        $request->user()->update(['password' => $request->password]);

        return $this->success(message: 'Sifre guncellendi.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        $request->user()->delete();

        return $this->noContent();
    }

    // Admin
    public function index(): JsonResponse
    {
        return $this->success(\App\Models\User::paginate(20));
    }

    public function showAdmin(\App\Models\User $user): JsonResponse
    {
        return $this->success(new UserResource($user));
    }
}
