<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required'     => 'Sıfırlama token\'ı zorunludur.',
            'email.required'     => 'E-posta adresi zorunludur.',
            'email.exists'       => 'Bu e-posta adresine kayıtlı hesap bulunamadı.',
            'password.required'  => 'Yeni şifre zorunludur.',
            'password.min'       => 'Şifre en az 8 karakter olmalıdır.',
            'password.confirmed' => 'Şifreler eşleşmiyor.',
        ];
    }
}
