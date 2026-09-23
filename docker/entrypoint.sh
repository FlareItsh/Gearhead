#!/bin/sh
set -e

# Default port for Render is 10000
export PORT="${PORT:-10000}"
export ENABLE_QUEUE_WORKER="${ENABLE_QUEUE_WORKER:-true}"

echo "==> Configuring Nginx on port ${PORT}..."
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/http.d/default.conf

# Ensure storage directories exist with proper permissions
echo "==> Preparing storage directories..."
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure public storage symlink
php artisan storage:link --force || true

# Production optimization caches
if [ "${APP_ENV}" = "production" ]; then
    echo "==> Caching Laravel configuration, routes, and views..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Run database migrations if enabled (default true)
if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
    echo "==> Running database migrations..."
    php artisan migrate --force --no-interaction || echo "Migration skipped or failed."
    
    # If running PostgreSQL, synchronize table sequences
    if [ "${DB_CONNECTION}" = "pgsql" ]; then
        echo "==> Syncing PostgreSQL sequences..."
        php artisan db:sync-sequences || true
    fi
fi

echo "==> Starting Supervisord (Nginx + PHP-FPM)..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
