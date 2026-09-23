# Stage 1: Build assets and vendor dependencies
FROM php:8.3-cli-alpine AS builder

# Install system dependencies for build stage
RUN apk add --no-cache \
    git \
    unzip \
    nodejs \
    npm \
    libzip-dev \
    libpng-dev \
    icu-dev

# Install required PHP extensions for Composer & Wayfinder
RUN docker-php-ext-install bcmath zip intl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install PHP dependencies first (cached if composer files don't change)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

# Install NPM dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy application code
COPY . .

# Generate autoload and run Wayfinder route generation before asset build
RUN composer dump-autoload --optimize --no-dev
RUN php artisan wayfinder:generate --with-form
RUN npm run build

# Remove node_modules to keep final image clean
RUN rm -rf node_modules


# Stage 2: Production runtime with Nginx and PHP-FPM
FROM php:8.3-fpm-alpine

# Install production dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    gettext \
    curl \
    postgresql-client \
    mysql-client \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pdo_mysql \
        bcmath \
        mbstring \
        zip \
        gd \
        intl \
        opcache \
        pcntl

# Install Composer in runtime for artisan optimization commands if needed
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy configurations
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/php.ini $PHP_INI_DIR/conf.d/custom.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /etc/nginx/http.d /run/nginx /var/log/supervisor

# Copy application files from builder
COPY --from=builder --chown=www-data:www-data /app /var/www/html

# Setup proper directory permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

ENV PORT=10000
ENV ENABLE_QUEUE_WORKER=true

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
