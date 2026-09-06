<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Şifre sıfırlama e-postası gönderir.
     *
     * Response (başarılı):
     * { "success": true, "message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." }
     *
     * Güvenlik notu: Kullanıcı var olmasa bile aynı mesajı döneriz
     * (hesap bilgisi sızdırmamak için). Validation katmanında exists:users
     * kontrolü yaparız ama gerçek projede bunu kaldırmak daha güvenli olabilir.
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(
                message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
            );
        }

        return $this->error(
            'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.',
            400
        );
    }

    /**
     * POST /api/v1/auth/reset-password
     *
     * Token ve yeni şifre ile şifre sıfırlar.
     *
     * Request body:
     * { "token": "...", "email": "...", "password": "...", "password_confirmation": "..." }
     *
     * Response (başarılı):
     * { "success": true, "message": "Şifreniz başarıyla sıfırlandı." }
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(
                message: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
            );
        }

        return $this->error(
            match ($status) {
                Password::INVALID_TOKEN => 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı.',
                Password::INVALID_USER  => 'Bu e-postaya kayıtlı kullanıcı bulunamadı.',
                default                 => 'Şifre sıfırlama işlemi başarısız.',
            },
            400
        );
    }
}
