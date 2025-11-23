# Laravel Backend Setup for Nuxt Sanctum Authentication

This document outlines the required Laravel backend configuration to work with the Nuxt frontend authentication system.

## Prerequisites

- Laravel 10+ or 11+
- Laravel Sanctum package installed
- Backend running on default Laravel development server (`http://localhost:8000` or your configured URL)

## Installation Steps

### 1. Install Laravel Sanctum

```bash
composer require laravel/sanctum
```

### 2. Publish Sanctum Configuration

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 3. Run Migrations

```bash
php artisan migrate
```

## Required Configuration

### 1. Environment Variables (.env)

Add these to your Laravel `.env` file:

```bash
# Application URL
APP_URL=http://localhost:8000

# Frontend URL(s) - CRITICAL for CORS and Session
SANCTUM_STATEFUL_DOMAINS=localhost:3000

# Session Configuration
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false  # Set to true in production with HTTPS

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 2. CORS Configuration (config/cors.php)

```php
<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'api/v1/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',  // Your Nuxt dev server
        // Add production URLs here
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,  // CRITICAL - Must be true
];
```

### 3. Session Configuration (config/session.php)

```php
'domain' => env('SESSION_DOMAIN', null),
'secure' => env('SESSION_SECURE_COOKIE', false),
'same_site' => 'lax',
```

### 4. Sanctum Configuration (config/sanctum.php)

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

### 5. Middleware Setup

#### For Laravel 11+ (bootstrap/app.php)

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

#### For Laravel 10 and below (app/Http/Kernel.php)

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

## Required API Endpoints

### 1. Registration Endpoint

Create `app/Http/Controllers/Auth/RegisterController.php`:

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'club_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ]);

        // Create the user
        $user = User::create([
            'club_name' => $validated['club_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Log the user in
        Auth::login($user);

        return response()->json([
            'user' => $user,
            'message' => 'Registration successful'
        ], 201);
    }
}
```

### 2. Login Endpoint

Create `app/Http/Controllers/Auth/LoginController.php`:

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => Auth::user(),
            'message' => 'Login successful'
        ]);
    }
}
```

### 3. Logout Endpoint

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
}
```

### 4. User Endpoint

```php
// In any controller or routes/api.php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

## Route Configuration

### routes/api.php

Add these routes to your `routes/api.php` file:

```php
<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// API v1 routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LogoutController::class, 'logout'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
    });
});
```

## Database Migration

Update your users table migration to include the new fields:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('club_name');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

## Model Configuration

Update your User model (`app/Models/User.php`):

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'club_name',
        'first_name',
        'last_name',
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

## Testing the Setup

### 1. Start Laravel Server

```bash
php artisan serve
```

This will start Laravel on `http://localhost:8000` by default.

### 2. Test CSRF Cookie Endpoint

```bash
curl http://localhost:8000/sanctum/csrf-cookie -i
```

You should see a 204 No Content response with Set-Cookie headers.

### 3. Test Registration

From your Nuxt frontend running on `http://localhost:3000`, submit the signup form.

## Common Issues & Solutions

### Issue 1: 419 CSRF Token Mismatch

**Solution:**
- Verify `SANCTUM_STATEFUL_DOMAINS` includes `localhost:3000`
- Ensure `SESSION_DOMAIN=localhost` (NOT `127.0.0.1`)
- Check CORS `supports_credentials` is `true`
- Clear browser cookies and try again

### Issue 2: CORS Errors

**Solution:**
- Add frontend URL to `allowed_origins` in `config/cors.php`
- Ensure `supports_credentials: true`
- Check all necessary paths are in the `paths` array

### Issue 3: Session Not Persisting

**Solution:**
- Use the same domain for both frontend and backend (e.g., both use `localhost`)
- Don't mix `127.0.0.1` and `localhost`
- Set `SESSION_DOMAIN=localhost` without the leading dot in development

### Issue 4: User Not Found After Registration

**Solution:**
- Check database connection
- Verify migrations have run
- Check that User model fillable fields include all required fields

## Production Checklist

When deploying to production:

- [ ] Set `SESSION_SECURE_COOKIE=true` in `.env`
- [ ] Use HTTPS for both frontend and backend
- [ ] Update `SANCTUM_STATEFUL_DOMAINS` with production domains
- [ ] Update `allowed_origins` in CORS config with production URLs
- [ ] Set proper `SESSION_DOMAIN` (with leading dot for subdomains: `.yourdomain.com`)
- [ ] Enable rate limiting on authentication endpoints
- [ ] Set up proper logging and monitoring
- [ ] Configure proper database backups
- [ ] Review and harden security settings

## Quick Install Using Laravel Breeze (Alternative)

If you want a quick setup with all auth endpoints:

```bash
composer require laravel/breeze --dev
php artisan breeze:install api
php artisan migrate
```

This will scaffold all authentication endpoints for you. Then just add the custom fields to the registration controller.

## Support

For issues specific to:
- **Nuxt Sanctum Module**: https://github.com/manchenkoff/nuxt-auth-sanctum
- **Laravel Sanctum**: https://laravel.com/docs/sanctum
- **CORS Issues**: https://laravel.com/docs/routing#cors
