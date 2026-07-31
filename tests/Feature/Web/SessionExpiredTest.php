<?php

namespace Tests\Feature\Web;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class SessionExpiredTest extends TestCase
{
    use RefreshDatabase;

    public function test_inertia_csrf_mismatch_renders_session_expired_error_page(): void
    {
        $request = Request::create('/logout', 'POST');
        $request->headers->set('X-Inertia', 'true');
        $request->headers->set('X-Requested-With', 'XMLHttpRequest');
        $request->setLaravelSession($this->app['session.store']);

        $baseResponse = $this->app->make(ExceptionHandler::class)
            ->render($request, new TokenMismatchException('CSRF token mismatch.'));

        $response = TestResponse::fromBaseResponse($baseResponse);

        $response->assertStatus(419);
        $response->assertHeader('X-Inertia', 'true');
        $response->assertJsonPath('component', 'Error');
        $response->assertJsonPath('props.status', 419);
    }

    public function test_non_inertia_csrf_mismatch_returns_419_without_inertia_page(): void
    {
        $request = Request::create('/logout', 'POST');
        $request->setLaravelSession($this->app['session.store']);

        $baseResponse = $this->app->make(ExceptionHandler::class)
            ->render($request, new TokenMismatchException('CSRF token mismatch.'));

        $response = TestResponse::fromBaseResponse($baseResponse);

        $response->assertStatus(419);
        $this->assertFalse($response->headers->has('X-Inertia'));
    }
}
