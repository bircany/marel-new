<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Model Observers
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);

        // Policy'leri kaydet
        Gate::policy(\App\Models\Category::class, \App\Policies\CategoryPolicy::class);
        Gate::policy(\App\Models\Brand::class,    \App\Policies\BrandPolicy::class);
        Gate::policy(\App\Models\Product::class,  \App\Policies\ProductPolicy::class);
        Gate::policy(\App\Models\Coupon::class,   \App\Policies\CouponPolicy::class);

        // Event → Listener kayıtları
        Event::listen(
            \App\Events\OrderPlaced::class,
            \App\Listeners\SendOrderConfirmationMail::class
        );
        Event::listen(
            \App\Events\OrderStatusChanged::class,
            \App\Listeners\SendOrderStatusMail::class
        );

        // Storage URL'sini APP_URL'e bağla (symlink için)
        \Illuminate\Support\Facades\URL::forceRootUrl(config('app.url'));
    }
}
