FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libzip-dev libpng-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip gd bcmath \
    && rm -rf /var/lib/apt/lists/*

RUN printf "upload_max_filesize=12M\npost_max_size=45M\n" > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Dependency layer (cache-friendly)
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction --prefer-dist

# App source (softtrade-client excluded via .dockerignore)
COPY . .
RUN composer dump-autoload --optimize \
    && mkdir -p storage/logs storage/framework/sessions storage/framework/views storage/framework/cache bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["bash", "docker/entrypoint.sh"]
