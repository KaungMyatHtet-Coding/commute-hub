# 🚗 CommuteHub Yangon

> **Enterprise-Grade Community Carpooling & Daily Commuter Ride-Sharing Platform for Yangon, Myanmar.**

[![Tests](https://img.shields.io/badge/PHPUnit-54%20Passing%20(321%20assertions)-brightgreen.svg)](https://github.com/laravel/framework)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Type%20Check-blue.svg)](https://www.typescriptlang.org/)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v1.x-9553e9.svg)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.x-38bdf8.svg)](https://tailwindcss.com)

---

## 🌟 Executive Summary

**CommuteHub Yangon** is a full-stack, enterprise-grade ride-sharing web application engineered specifically to solve daily office commuting challenges in Yangon. Between high peak-hour taxi surge pricing, severe arterial traffic bottlenecks, and overcrowded public bus networks, CommuteHub provides verified office workers and drivers a secure, comfortable, and affordable carpooling alternative across all **39 Yangon townships**.

Built with **Laravel 11**, **Inertia.js**, **React 18**, **TypeScript**, and **Tailwind CSS**, the platform pairs seamless SPA responsiveness with server-side security, strict identity verification, and high-concurrency seat reservation guarantees.

---

## ⚙️ Key Engineering Highlights

### 1. 🔒 Atomic Concurrency & Seat Locking (`lockForUpdate`)
- **Race Condition Prevention**: During morning and evening rush hours, multiple commuters may attempt to book the last available seat simultaneously.
- **Pessimistic Locking**: `BookingController@store` executes within a database transaction wrapping `Ride::where('id', $rideId)->lockForUpdate()->firstOrFail()`.
- **Atomic Guarantees**: Seat availability is verified and reserved atomically at the database engine level, preventing overbooking.

### 2. 🪪 Mandatory KYC & Anti-Spoofing Security
- **Government Identity Audit**: Mandatory upload of National Registration Cards (NRC Front & Back) and real human portrait photos before any ride booking or driver publishing is unlocked.
- **Rate-Limited Profile Governance**: Sensitive profile updates (NRC, phone number, vehicle registration) are rate-limited to **twice per month** and require manual administrator review and approval before taking effect.
- **Driver Verification Pipeline**: Drivers submit vehicle details, passenger seat capacity, license plate, and driver's license photos. Admins verify credentials from an interactive admin queue before the user receives the `driver` role and can publish trips.

### 3. 🛡️ 2-Layer Enterprise Admin Security Gate
- **Role-Based Access Control**: Standard routes protected by Spatie `role:admin` middleware.
- **Cryptographic Secondary Passcode Gate**: Even after authenticating with admin credentials, entering `/admin/*` requires passing a separate, bcrypt-hashed session passcode (`admin.passcode` middleware).
- **Executive Governance Suite**: Live platform metrics, user blocking/suspension with custom violation reasons, driver verification workflows, interactive visual distribution charts, driver rating leaderboards, and complete filterable ride audit logs with PDF export.

### 4. 🌐 Dual-Language Architecture (English & Myanmar Unicode `EN | မြန်မာ`)
- **First-Class Myanmar Font Support**: Native typography loading (`Padauk`, `Noto Sans Myanmar`, `Pyidaungsu`) configured across `app.blade.php` and `tailwind.config.js`.
- **Reactive Translation Context**: Client-side `useLanguage()` provider with persistent storage and fallback dictionary.
- **Dynamic Township Normalization**: The `getTownshipName()` helper displays bilingual township names (e.g. `Kamayut (ကမာရွတ်)`) while preserving standardized English strings in the database, preserving backend query consistency and database composite indexes.

### 5. 🎨 Professional Dark / Light Mode & Adaptive UX
- **WCAG-Compliant Dark Mode**: Deep slate background system (`#121212`, `#16161D`, `#1C1C22`) with carefully tuned typography contrast and zero blinding pure whites.
- **Responsive Screen Adaptation**: Optimized layouts for mobile viewports (320px, 375px, 425px) up to ultra-wide displays with a fixed bottom navigation bar on mobile and collapsible sidebar navigation on desktop.
- **Zero Native Browser Popups**: Custom in-app Tailwind React `<ConfirmModal />` for trip lifecycles (Start Trip, Complete Trip, Cancel Trip) and floating non-intrusive `<FlashToast />` notifications.

### 6. 🌸 Commuter Safety Ecosystem
- **Ladies-Only Carpool Option**: Female drivers can restrict their carpools exclusively to female passengers.
- **Direct Click-to-Call**: Verified passenger-driver contact integration.
- **Cashless Settlement**: Instant KPay and WavePay QR payment previews.
- **One-Tap Emergency Share**: Share trip details, driver name, vehicle plate, and live route landmarks directly with family or emergency contacts.

---

## 👥 Demo Accounts & Pre-Seeded Credentials

All seeded accounts share the default password: `password`.

| Role | Email | Password | Secondary Passcode | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@commutehub.test` | `password` | `admin1234` | Full access to Admin Panel, Verifications & User Management |
| **Verified Driver** | `aung.min@commutehub.test` | `password` | *N/A* | Verified driver (Toyota Probox, Kamayut ⇄ Kyauktada) |
| **Verified Driver (Ladies Only)** | `susu.win@commutehub.test` | `password` | *N/A* | Verified driver (Honda Fit, Insein ⇄ Bahan, Ladies Only) |
| **Commuter Passenger** | `ko.htet@commutehub.test` | `password` | *N/A* | Verified passenger with active booking |
| **Commuter Passenger** | `may.zin@commutehub.test` | `password` | *N/A* | Verified passenger with active booking |

---

## 🚀 Local Development Setup

### Prerequisites
- PHP 8.2 or 8.3 with extensions (`pdo_mysql`, `mbstring`, `exif`, `pcntl`, `bcmath`, `gd`, `zip`)
- Composer 2.x
- Node.js 20.x & npm
- MySQL 8.x or MariaDB

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-username/commute-hub.git
cd commute-hub

# 2. Install PHP and Node dependencies
composer install
npm install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Set up database credentials in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=commute_hub
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Run migrations and seed sample demo data
php artisan migrate --seed
php artisan storage:link

# 6. Build frontend assets
npm run build

# 7. Start local development server
php artisan serve
```

Access the application in your browser at `http://127.0.0.1:8000`.

---

## 🧪 Automated Testing Suite

The application includes comprehensive feature, unit, and lifecycle tests covering authentication, KYC gates, rate limiting, driver verifications, admin passcode security, and ride concurrency.

```bash
# Run the complete test suite
php artisan test
```

### Test Results Breakdown:
```text
PASS  Tests\Unit\ExampleTest
PASS  Tests\Feature\AdminVerificationTest (15 tests)
PASS  Tests\Feature\Auth\AuthenticationTest (4 tests)
PASS  Tests\Feature\Auth\EmailVerificationTest (3 tests)
PASS  Tests\Feature\Auth\PasswordConfirmationTest (3 tests)
PASS  Tests\Feature\Auth\PasswordResetTest (4 tests)
PASS  Tests\Feature\Auth\PasswordUpdateTest (2 tests)
PASS  Tests\Feature\Auth\RegistrationTest (3 tests)
PASS  Tests\Feature\ExampleTest (1 test)
PASS  Tests\Feature\ProfileTest (5 tests)
PASS  Tests\Feature\RideWorkflowTest (13 tests)

Tests:    54 passed (321 assertions)
Duration: ~22s
```

```bash
# Verify TypeScript type integrity
npx tsc --noEmit
```

---

## ☁️ Cloud Deployment (Railway / Render / Docker)

CommuteHub is packaged for zero-friction cloud deployment.

### Method 1: Railway (Native Nixpacks)
1. Push repository to GitHub.
2. Create a new Project in Railway and connect the repository.
3. Add a **MySQL** database service in Railway.
4. Configure environment variables in Railway:
   - `APP_ENV=production`
   - `APP_KEY=base64:...` (generate using `php artisan key:generate --show`)
   - `APP_DEBUG=false`
   - `APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}`
   - `DB_CONNECTION=mysql`
   - `DB_HOST=${{MySQL.MYSQLHOST}}`
   - `DB_PORT=${{MySQL.MYSQLPORT}}`
   - `DB_DATABASE=${{MySQL.MYSQLDATABASE}}`
   - `DB_USERNAME=${{MySQL.MYSQLUSER}}`
   - `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
5. Railway automatically detects `nixpacks.toml` and launches `docker/start.sh`, which runs migrations, caches routes, seeds initial demo accounts if empty, and starts the service.

### Method 2: Docker Container (Render / Cloud Run / VPS)
```bash
# Build the production image
docker build -t commutehub:latest .

# Run container
docker run -p 8080:8080 \
  -e APP_ENV=production \
  -e APP_KEY=base64:... \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=your-mysql-host \
  -e DB_DATABASE=commute_hub \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=secret \
  commutehub:latest
```

---

## 📂 Project Architecture

```text
commute-hub/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Admin, Auth, Booking, DriverApplication, Ride, Profile
│   │   ├── Middleware/        # EnsureKycCompleted, AdminPasscodeMiddleware, CheckUserNotBlocked
│   │   └── Requests/          # StoreRideRequest, StoreBookingRequest, StoreDriverApplicationRequest
│   ├── Models/                # User, Ride, RideBooking, RideStop, Vehicle, SystemSetting
│   └── Providers/             # AppServiceProvider (HTTPS forcing, trustProxies)
├── database/
│   ├── migrations/            # Schema definitions & composite indexes
│   └── seeders/               # DatabaseSeeder (Admin, Drivers, Passengers, Scheduled Trips)
├── docker/
│   └── start.sh               # Self-healing production entrypoint script
├── resources/
│   ├── js/
│   │   ├── Components/        # Atomic UI components, Modals, LanguageSwitcher, ThemeToggle
│   │   ├── Constants/         # yangonTownships.ts (All 39 Townships & Ride Rules)
│   │   ├── Contexts/          # LanguageContext.tsx (Bilingual EN/MM dictionary & helpers)
│   │   ├── Layouts/           # AuthenticatedLayout, GuestLayout
│   │   └── Pages/             # Welcome, Rides, Dashboard, Bookings, Admin, Profile
│   └── views/
│       └── app.blade.php      # Root HTML template with Myanmar font imports & favicon
├── nixpacks.toml              # Railway native build specification
├── Dockerfile                 # Multi-stage production container build (Node.js + PHP 8.2 Apache)
└── tests/                     # 54 Feature & Unit tests covering full platform lifecycle
```

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
