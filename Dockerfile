FROM php:8.3-cli-bookworm

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libpng-dev libzip-dev libonig-dev \
    libfreetype6-dev libjpeg62-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql mbstring gd zip bcmath opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs && apt-get clean

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Node dependencies + build (use vite directly — skip tsc type-check in Docker)
COPY package.json package-lock.json vite.config.js tsconfig.json ./
COPY resources ./resources
RUN npm ci && npx vite build && rm -rf node_modules

# App source
COPY . .

# Laravel caches (needs APP_KEY at build time — skip if not set)
RUN php artisan config:cache 2>/dev/null || true \
    && php artisan route:cache 2>/dev/null || true \
    && php artisan view:cache 2>/dev/null || true

# Storage permissions
RUN mkdir -p storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
