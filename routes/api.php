<?php

use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\FlowController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\V1\AnalyticsExportController;
use App\Http\Controllers\Api\V2\AnalyticsController as V2AnalyticsController;
use App\Http\Controllers\Api\V2\CallQualityController as V2CallQualityController;
use App\Http\Controllers\Api\V2\CallSearchController as V2CallSearchController;
use App\Http\Controllers\Api\V2\MonitoringController as V2MonitoringController;
use App\Http\Controllers\Api\V2\TranscriptSearchController as V2TranscriptSearchController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->withoutMiddleware(['auth:sanctum', 'throttle:api']);

Route::get('/v1/analytics/export', AnalyticsExportController::class)
    ->middleware('throttle:60,1')
    ->name('api.v1.analytics.export');

Route::middleware(['token.expiry', 'auth:sanctum', 'throttle:api_tenant'])->name('api.v1.')->prefix('v1')->group(function () {
    Route::apiResource('flows', FlowController::class)->except(['destroy']);
    Route::apiResource('calls', CallController::class)->only(['index', 'show']);
    Route::get('calls/{call}/transcript', [CallController::class, 'transcript']);
    Route::apiResource('tenants', TenantController::class)->except(['index', 'destroy']);
});

Route::middleware(['token.expiry', 'auth:sanctum', 'throttle:api_tenant'])->name('api.v2.')->prefix('v2')->group(function () {
    Route::apiResource('flows', FlowController::class)->except(['destroy']);
    Route::get('calls/search', [V2CallSearchController::class, 'index']);
    Route::get('calls/{call}/quality', [V2CallQualityController::class, 'show']);
    Route::apiResource('calls', CallController::class)->only(['index', 'show']);
    Route::get('calls/{call}/transcript', [CallController::class, 'transcript']);
    Route::get('transcripts/search', [V2TranscriptSearchController::class, 'index']);
    Route::get('analytics/summary', [V2AnalyticsController::class, 'summary']);
    Route::get('monitoring/health', [V2MonitoringController::class, 'health'])->withoutMiddleware(['auth:sanctum']);
    Route::get('monitoring/system', [V2MonitoringController::class, 'system']);
    Route::apiResource('tenants', TenantController::class)->except(['index', 'destroy']);
});
