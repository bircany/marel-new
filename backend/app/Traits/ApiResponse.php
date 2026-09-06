<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Başarılı JSON yanıtı.
     */
    protected function success(
        mixed $data = null,
        string $message = 'İşlem başarılı.',
        int $code = 200,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if (! is_null($data)) {
            $response['data'] = $data;
        }

        if (! empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Hata JSON yanıtı.
     */
    protected function error(
        string $message = 'Bir hata oluştu.',
        int $code = 400,
        mixed $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (! is_null($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * 201 Created yanıtı.
     */
    protected function created(
        mixed $data,
        string $message = 'Başarıyla oluşturuldu.'
    ): JsonResponse {
        return $this->success($data, $message, 201);
    }

    /**
     * 204 No Content yanıtı.
     */
    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * 401 Unauthorized yanıtı.
     */
    protected function unauthorized(string $message = 'Yetkisiz erişim.'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * 403 Forbidden yanıtı.
     */
    protected function forbidden(string $message = 'Bu işlem için yetkiniz yok.'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * 404 Not Found yanıtı.
     */
    protected function notFound(string $message = 'Kaynak bulunamadı.'): JsonResponse
    {
        return $this->error($message, 404);
    }
}
