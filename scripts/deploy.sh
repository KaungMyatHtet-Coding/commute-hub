#!/usr/bin/env bash
set -e

# Delegate to docker/start.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$ROOT_DIR/docker/start.sh" ]; then
    chmod +x "$ROOT_DIR/docker/start.sh"
    exec "$ROOT_DIR/docker/start.sh"
fi

echo "=================================================="
echo "    CommuteHub Production Deployment Startup     "
echo "=================================================="

php artisan storage:link --force || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tr -dc '0-9')
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    php artisan db:seed --force
fi

PORT="${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
