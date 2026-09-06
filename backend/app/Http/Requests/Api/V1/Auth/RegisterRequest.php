<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            // dns kontrolu dev/staging ortamlarda gereksiz 422 uretebiliyor
            'email'      => ['required', 'email:rfc', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Ad alanı zorunludur.',
            'last_name.required'  => 'Soyad alanı zorunludur.',
            'email.required'      => 'E-posta adresi zorunludur.',
            'email.email'         => 'Geçerli bir e-posta adresi giriniz.',
            'email.unique'        => 'Bu e-posta adresi zaten kullanımda.',
            'phone.unique'        => 'Bu telefon numarası zaten kullanımda.',
            'password.required'   => 'Şifre alanı zorunludur.',
            'password.min'        => 'Şifre en az 8 karakter olmalıdır.',
            'password.confirmed'  => 'Şifreler eşleşmiyor.',
        ];
    }
}
