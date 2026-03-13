#!/usr/bin/env bash
set -e

if [ ! -f /var/www/html/.env ] && [ -f /var/www/html/.env.example ]; then
  cp /var/www/html/.env.example /var/www/html/.env
fi

if [ -f /var/www/html/.env ]; then
  APP_URL_VALUE="${APP_URL:-http://localhost:3000}"
  DB_HOST_VALUE="${DB_HOST:-34.60.27.246}"
  DB_PORT_VALUE="${DB_PORT:-1234}"
  DB_DATABASE_VALUE="${DB_DATABASE:-database-extraction-tool}"
  DB_USERNAME_VALUE="${DB_USERNAME:-root}"
  DB_PASSWORD_VALUE="${DB_PASSWORD:-example}"

  sed -i "s|^APP_URL=.*|APP_URL=${APP_URL_VALUE}|" /var/www/html/.env
  sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST_VALUE}|" /var/www/html/.env
  sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT_VALUE}|" /var/www/html/.env
  sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE_VALUE}|" /var/www/html/.env
  sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME_VALUE}|" /var/www/html/.env
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD_VALUE}|" /var/www/html/.env
fi

mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R ug+rwx /var/www/html/storage /var/www/html/bootstrap/cache

if [ ! -f /var/www/html/vendor/autoload.php ] && [ -f /var/www/html/composer.json ]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -f /var/www/html/artisan ]; then
  php /var/www/html/artisan key:generate --force || true
fi

exec apache2-foreground