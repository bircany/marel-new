#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

echo "[marel-backend] waiting for database..."
until php -r '
$host = getenv("DB_HOST") ?: "db";
$port = getenv("DB_PORT") ?: "5432";
$db = getenv("DB_DATABASE") ?: "marel_backend";
$user = getenv("DB_USERNAME") ?: "postgres";
$pass = getenv("DB_PASSWORD") ?: "123";
try {
  new PDO("pgsql:host={$host};port={$port};dbname={$db}", $user, $pass);
  exit(0);
} catch (Throwable $e) {
  exit(1);
}
'; do
  sleep 2
  echo "[marel-backend] db not ready yet..."
done

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Ensure runtime env overrides for Docker/Marel
php -r '
$file = ".env";
$pairs = [
  "APP_NAME" => getenv("APP_NAME") ?: "MarelBackend",
  "APP_URL" => getenv("APP_URL") ?: "http://localhost:8081",
  "APP_ENV" => getenv("APP_ENV") ?: "local",
  "APP_DEBUG" => getenv("APP_DEBUG") ?: "true",
  "DB_CONNECTION" => getenv("DB_CONNECTION") ?: "pgsql",
  "DB_HOST" => getenv("DB_HOST") ?: "db",
  "DB_PORT" => getenv("DB_PORT") ?: "5432",
  "DB_DATABASE" => getenv("DB_DATABASE") ?: "marel_backend",
  "DB_USERNAME" => getenv("DB_USERNAME") ?: "postgres",
  "DB_PASSWORD" => getenv("DB_PASSWORD") ?: "123",
  "FRONTEND_URL" => getenv("FRONTEND_URL") ?: "http://localhost:3000",
  "SANCTUM_STATEFUL_DOMAINS" => getenv("SANCTUM_STATEFUL_DOMAINS") ?: "localhost:3000",
];
if (getenv("CORS_ALLOWED_ORIGINS")) {
  $pairs["CORS_ALLOWED_ORIGINS"] = getenv("CORS_ALLOWED_ORIGINS");
}
$env = file_exists($file) ? file_get_contents($file) : "";
foreach ($pairs as $key => $value) {
  $line = $key . "=" . $value;
  if (preg_match("/^{$key}=.*/m", $env)) {
    $env = preg_replace("/^{$key}=.*/m", $line, $env);
  } else {
    $env .= PHP_EOL . $line;
  }
}
file_put_contents($file, $env);
'

if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
  echo "[marel-backend] generating APP_KEY..."
  php artisan key:generate --force
fi

mkdir -p storage/logs storage/framework/{sessions,views,cache} bootstrap/cache
chmod -R 775 storage bootstrap/cache || true

if [ ! -d vendor ]; then
  echo "[marel-backend] composer install..."
  composer install --no-interaction --prefer-dist
fi

echo "[marel-backend] migrate + seed..."
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true

echo "[marel-backend] listening on 0.0.0.0:8080 (host :8081)"
exec php artisan serve --host=0.0.0.0 --port=8080
