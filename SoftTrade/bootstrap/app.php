<?php

use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Tüm API isteklerini JSON'a zorla
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);

        // CSRF doğrulamasından API rotalarını hariç tut (token-based auth)
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Route middleware alias'ları
        $middleware->alias([
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // API rotalarında tüm hataları JSON olarak döndür
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                try {
                    \Illuminate\Support\Facades\Log::debug('API Error Trace:', [
                        'url' => $request->fullUrl(),
                        'method' => $request->method(),
                        'auth_header' => $request->header('Authorization') ? 'Present' : 'Missing',
                        'error' => $e->getMessage(),
                        'class' => get_class($e),
                    ]);
                } catch (\Throwable $logEx) {
                    // Loglama hatasını görmezden gel, asıl hatayı dönmeye devam et
                }

                if ($e instanceof ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Doğrulama hatası.',
                        'errors'  => $e->errors(),
                    ], 422);
                }

                // 404 — Model bulunamadı
                if ($e instanceof NotFoundHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'İstenen kaynak bulunamadı.',
                    ], 404);
                }

                // 405 — Method not allowed
                if ($e instanceof MethodNotAllowedHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Bu HTTP metodu desteklenmiyor.',
                    ], 405);
                }

                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Oturumunuz sona ermiş veya yetkiniz yok. Lütfen giriş yapın.',
                    ], 401);
                }

                $status = 500;
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                } elseif (method_exists($e, 'getStatusCode')) {
                    $status = $e->getStatusCode();
                }

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Sunucuda bir hata oluştu.',
                    'errors'  => null,
                ], $status);
            }
        });
    })
    ->create();
