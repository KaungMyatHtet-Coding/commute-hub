#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    CommuteHub Production Deployment Startup     "
echo "=================================================="

# 1. Symlink storage
echo "--> Ensuring storage symlink exists..."
php artisan storage:link --force || true

# 2. Production Caches
echo "--> Optimizing configuration, routes, and views cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Database Migrations
echo "--> Running database migrations..."
php artisan migrate --force

# 4. Check whether database needs initial seeding
echo "--> Checking user records..."
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tr -dc '0-9')

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "--> Zero users detected. Executing initial database seed..."
    php artisan db:seed --force
    echo "--> Database seeded successfully with demo users, rides, and settings."
else
    echo "--> Existing database populated with ${USER_COUNT} user(s). Skipping seed to preserve production state."
fi

# 5. Bind port and launch web server
PORT="${PORT:-8080}"
echo "--> Starting web server on port ${PORT}..."

if command -v apache2-foreground >/dev/null 2>&1; then
    sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
    sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/*.conf 2>/dev/null || true
    exec apache2-foreground
else
    exec php artisan serve --host=0.0.0.0 --port="${PORT}"
fi
