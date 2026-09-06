<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Products\ProductController;
use App\Http\Controllers\Api\V1\Products\CategoryController;
use App\Http\Controllers\Api\V1\Products\BrandController;
use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Coupons\CouponController;
use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Http\Controllers\Api\V1\Users\UserController;
use App\Http\Controllers\Api\V1\Users\AddressController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\MediaAssetController;
use App\Http\Controllers\Api\V1\Admin\SiteSettingsController;
use App\Http\Controllers\Api\V1\Settings\PublicSettingsController;
use App\Http\Controllers\Api\V1\Payments\PaymentController;
use App\Http\Controllers\Api\V1\Reviews\ReviewController;
use App\Http\Controllers\Api\V1\Contact\ContactMessageController;

/*
|--------------------------------------------------------------------------
| API V1 Route Grubu
| Base URL: /api/v1/...
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->name('api.v1.')->group(function () {

    Route::get('settings/public', [PublicSettingsController::class, 'show'])->name('settings.public');
    Route::post('contact', [ContactMessageController::class, 'store'])->name('contact.store');

    // ── Public rotalar (auth gerektirmiyor) ───────────────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('register',        [AuthController::class, 'register'])->name('register');
        Route::post('login',           [AuthController::class, 'login'])->name('login');
        Route::post('forgot-password', [PasswordController::class, 'sendResetLink'])->name('password.email');
        Route::post('reset-password',  [PasswordController::class, 'reset'])->name('password.reset');
    });

    // Ürünler & Kategoriler (herkese açık, salt okunur)
    Route::get('categories',              [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{category}',   [CategoryController::class, 'show'])->name('categories.show');
    Route::get('products',                [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
    Route::post('products/{product:slug}/price-preview', [ProductController::class, 'previewPrice'])->name('products.price-preview');

    // Markalar (herkese açık)
    Route::get('brands',          [BrandController::class, 'index'])->name('brands.index');
    Route::get('brands/{brand}',  [BrandController::class, 'show'])->name('brands.show');

    // Ürün yorumları (herkese açık — sadece onaylanmış)
    Route::get('products/{product:slug}/reviews', [ReviewController::class, 'index'])->name('products.reviews.index');

    // Misafir sipariş / kargo takibi (sipariş no + e-posta)
    Route::post('orders/track', [OrderController::class, 'track'])
        ->middleware('throttle:20,1')
        ->name('orders.track');

    // Sepet (giriş yapılmış VEYA misafir kullanıcı — auth opsiyonel)
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('',           [CartController::class, 'index'])->name('index');
        Route::post('/',          [CartController::class, 'store'])->name('store');
        Route::put('{cartItem}',  [CartController::class, 'update'])->name('update');
        Route::delete('{cartItem}', [CartController::class, 'destroy'])->name('destroy');
        Route::delete('',        [CartController::class, 'clear'])->name('clear');
        Route::post('merge',         [CartController::class, 'merge'])->name('merge');
        Route::post('apply-coupon',  [CartController::class, 'applyCoupon'])->name('apply-coupon');
        Route::delete('remove-coupon', [CartController::class, 'removeCoupon'])->name('remove-coupon');
    });

        // Siparişler (store: auth opsiyonel — misafir checkout)
        Route::post('orders', [OrderController::class, 'store'])
            ->middleware('throttle:30,1')
            ->name('orders.store');

        Route::middleware('auth:sanctum')->group(function () {

        // Auth (giriş yapılmış kullanıcı)
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('logout',  [AuthController::class, 'logout'])->name('logout');
            Route::get('me',       [AuthController::class, 'me'])->name('me');
            Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
        });

        // Profil
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('',        [UserController::class, 'show'])->name('show');
            Route::put('',        [UserController::class, 'update'])->name('update');
            Route::delete('',     [UserController::class, 'destroy'])->name('destroy');
            Route::put('password', [UserController::class, 'updatePassword'])->name('password');
        });

        // Adresler
        Route::apiResource('addresses', \App\Http\Controllers\Api\V1\Users\AddressController::class);

        // Siparişler
        Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
        Route::get('orders/{order}/cargo', [OrderController::class, 'cargoStatus'])->name('orders.cargo');

        // Ödeme
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::post('initiate', [PaymentController::class, 'initiate'])->name('initiate');
            Route::post('callback', [PaymentController::class, 'callback'])->name('callback');
        });

        // Yorumlar (sadece satın almış kullanıcılar)
        Route::post('reviews', [ReviewController::class, 'store'])->name('reviews.store');
        Route::get('coupons/my', [CouponController::class, 'myCoupons'])->name('coupons.my');
        Route::get('reviews/mine', [ReviewController::class, 'myReviews'])->name('reviews.mine');
        Route::put('reviews/{review}', [ReviewController::class, 'updateMine'])->name('reviews.update');

        // ── Admin rotaları (role:admin middleware) ────────────────────────
        Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
            Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
            Route::get('settings', [SiteSettingsController::class, 'index'])->name('settings.index');
            Route::put('settings/{section}', [SiteSettingsController::class, 'update'])->name('settings.update');

            // Ürün yönetimi
            Route::get('products/{product}', [ProductController::class, 'adminShow'])->name('products.show');
            Route::apiResource('products',   ProductController::class)->except(['index', 'show']);
            Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
            Route::apiResource('brands',     BrandController::class)->except(['index', 'show']);
            Route::apiResource('coupons',    CouponController::class);
            Route::get('media-galleries', [MediaAssetController::class, 'galleries'])->name('media-galleries.index');
            Route::post('media-galleries', [MediaAssetController::class, 'storeGallery'])->name('media-galleries.store');
            Route::put('media-galleries/{mediaGallery}', [MediaAssetController::class, 'updateGallery'])->name('media-galleries.update');
            Route::delete('media-galleries/{mediaGallery}', [MediaAssetController::class, 'destroyGallery'])->name('media-galleries.destroy');
            Route::post('media-galleries/{mediaGallery}/assets', [MediaAssetController::class, 'storeGalleryAssets'])->name('media-galleries.assets.store');
            Route::get('media-assets', [MediaAssetController::class, 'index'])->name('media-assets.index');
            Route::post('media-assets', [MediaAssetController::class, 'store'])->name('media-assets.store');
            Route::delete('media-assets/{mediaAsset}', [MediaAssetController::class, 'destroy'])->name('media-assets.destroy');

            // Ürün — çoklu görsel yükleme / silme
            Route::post('products/{product}/images',                [ProductController::class, 'uploadImages'])->name('products.images.upload');
            Route::delete('products/{product}/images/{image}',      [ProductController::class, 'deleteImage'])->name('products.images.destroy');

            // Ürün — varyant ekleme / silme
            Route::post('products/{product}/variants',              [ProductController::class, 'storeVariant'])->name('products.variants.store');
            Route::put('products/{product}/variants/{variant}',     [ProductController::class, 'updateVariant'])->name('products.variants.update');
            Route::put('products/{product}/variants/{variant}/option-values', [ProductController::class, 'syncVariantOptionValues'])->name('products.variants.option-values.sync');
            Route::delete('products/{product}/variants/{variant}',  [ProductController::class, 'destroyVariant'])->name('products.variants.destroy');
            Route::post('products/{product}/option-axes', [ProductController::class, 'storeOptionAxis'])->name('products.option-axes.store');
            Route::put('products/{product}/option-axes/{axis}', [ProductController::class, 'updateOptionAxis'])->name('products.option-axes.update');
            Route::delete('products/{product}/option-axes/{axis}', [ProductController::class, 'destroyOptionAxis'])->name('products.option-axes.destroy');
            Route::post('products/{product}/option-axes/{axis}/values', [ProductController::class, 'storeOptionValue'])->name('products.option-values.store');
            Route::put('products/{product}/option-axes/{axis}/values/{value}', [ProductController::class, 'updateOptionValue'])->name('products.option-values.update');
            Route::delete('products/{product}/option-axes/{axis}/values/{value}', [ProductController::class, 'destroyOptionValue'])->name('products.option-values.destroy');

            // Sipariş yönetimi
            Route::get('orders',                [OrderController::class, 'adminIndex'])->name('orders.index');
            Route::get('orders/{order}',        [OrderController::class, 'adminShow'])->name('orders.show');
            Route::put('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

            // Kullanıcı yönetimi
            Route::apiResource('users', UserController::class)->except(['store']);

            // Yorum yönetimi
            Route::get('reviews',                          [ReviewController::class, 'adminIndex'])->name('reviews.index');
            Route::put('reviews/{review}/status',          [ReviewController::class, 'updateStatus'])->name('reviews.status');

            // İletişim mesajları
            Route::get('contact-messages', [ContactMessageController::class, 'adminIndex'])->name('contact-messages.index');
            Route::put('contact-messages/{contactMessage}', [ContactMessageController::class, 'adminUpdate'])->name('contact-messages.update');
        });
    });
});

// Webhook (Sanctum dışında — ödeme sağlayıcısından gelir)
Route::post('v1/webhooks/payment', [PaymentController::class, 'webhook'])
    ->name('api.v1.webhooks.payment')
    ->middleware('throttle:60,1');



