# ==============================================================================
# Stage 1: Build Frontend Assets with Node.js
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install npm dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production assets with Vite
COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Production PHP Apache Server
# ==============================================================================
FROM php:8.2-apache AS production

# Install system dependencies & libraries for PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configure Apache DocumentRoot to point to Laravel's public/ directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Production PHP configurations
RUN { \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.revalidate_freq=2'; \
        echo 'opcache.fast_shutdown=1'; \
        echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

RUN { \
        echo 'upload_max_filesize = 16M'; \
        echo 'post_max_size = 20M'; \
        echo 'memory_limit = 256M'; \
    } > /usr/local/etc/php/conf.d/custom-php.ini

WORKDIR /var/www/html

# Copy application source code
COPY . .

# Copy compiled frontend assets from frontend-builder stage
COPY --from=frontend-builder /app/public/build ./public/build

# Install production PHP dependencies (no dev, optimized classmap)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Set permissions for Laravel storage and cache directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod +x /var/www/html/docker/start.sh \
    && chmod +x /var/www/html/scripts/deploy.sh

# Default port for cloud platforms
EXPOSE 8080

ENTRYPOINT ["/var/www/html/docker/start.sh"]
