<?php

use App\Http\Middleware\CheckTokenExpiry;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IpAllowlist;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\ValidateTwilioRequest;
use App\Infrastructure\Persistence\Eloquent\ErrorEventModel;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        $middleware->api(append: [
            SecurityHeaders::class,
        ]);

        $middleware->alias([
            'twilio.verify' => ValidateTwilioRequest::class,
            'token.expiry' => CheckTokenExpiry::class,
            'ip.allowlist' => IpAllowlist::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'twilio/*',
            'stripe/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::location(route('login'));
            }

            return null;
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'status' => 404,
                ])->toResponse($request)->setStatusCode(404);
            }

            return null;
        });

        $exceptions->render(function (TokenMismatchException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'status' => 419,
                ])->toResponse($request)->setStatusCode(419);
            }

            return null;
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->header('X-Inertia') && in_array($e->getStatusCode(), [403, 419], true)) {
                return Inertia::render('Error', [
                    'status' => $e->getStatusCode(),
                ])->toResponse($request)->setStatusCode($e->getStatusCode());
            }

            return null;
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'status' => 429,
                    'message' => 'Too many requests. Please wait a moment and try again.',
                ])->toResponse($request)->setStatusCode(429);
            }

            return null;
        });

        $exceptions->reportable(function (Throwable $e) {
            if ($e instanceof HttpResponseException) {
                return;
            }

            if ($e instanceof ValidationException) {
                return;
            }

            try {
                ErrorEventModel::record($e);
            } catch (Throwable) {
                // Silent — prevent cascade when DB transaction already aborted
            }
        });
    })->create();
