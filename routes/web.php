<?php

use App\Http\Controllers\Api\DataDeletionController;
use App\Http\Controllers\Api\DataExportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Twilio\SmsController as TwilioSmsController;
use App\Http\Controllers\Twilio\WebhookController;
use App\Http\Controllers\Web\AcceptInviteController;
use App\Http\Controllers\Web\ActivityLogController;
use App\Http\Controllers\Web\AnalyticsController;
use App\Http\Controllers\Web\AnalyticsStudioController;
use App\Http\Controllers\Web\ApiTokenController;
use App\Http\Controllers\Web\BillingController;
use App\Http\Controllers\Web\CallController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DataProtectionController;
use App\Http\Controllers\Web\DocumentsController;
use App\Http\Controllers\Web\ElevenLabsAgentController;
use App\Http\Controllers\Web\ElevenLabsConnectController;
use App\Http\Controllers\Web\ErrorMonitoringController;
use App\Http\Controllers\Web\FlowCommentController;
use App\Http\Controllers\Web\FlowController;
use App\Http\Controllers\Web\FlowTestController;
use App\Http\Controllers\Web\GettingStartedController;
use App\Http\Controllers\Web\ImpersonationController;
use App\Http\Controllers\Web\Integrations\HubSpot\HubSpotConsoleController;
use App\Http\Controllers\Web\Integrations\HubSpot\HubSpotCrmObjectController;
use App\Http\Controllers\Web\Integrations\HubSpot\HubSpotModulePageController;
use App\Http\Controllers\Web\Integrations\HubSpot\HubSpotVoiceSyncController;
use App\Http\Controllers\Web\Integrations\HubSpotIntegrationController;
use App\Http\Controllers\Web\Integrations\IntegrationsController;
use App\Http\Controllers\Web\Integrations\LookerStudioIntegrationController;
use App\Http\Controllers\Web\Integrations\N8nIntegrationController;
use App\Http\Controllers\Web\MonitorController;
use App\Http\Controllers\Web\NotificationController;
use App\Http\Controllers\Web\PhoneNumberController;
use App\Http\Controllers\Web\PrivacyController;
use App\Http\Controllers\Web\QualityController;
use App\Http\Controllers\Web\RecordingController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\ScheduledCallController;
use App\Http\Controllers\Web\SearchController;
use App\Http\Controllers\Web\SmsAutoReplyController;
use App\Http\Controllers\Web\SmsCampaignController;
use App\Http\Controllers\Web\SmsController;
use App\Http\Controllers\Web\StripeController;
use App\Http\Controllers\Web\StripeWebhookController;
use App\Http\Controllers\Web\SystemHealthController;
use App\Http\Controllers\Web\TeamMemberController;
use App\Http\Controllers\Web\TenantSettingsController;
use App\Http\Controllers\Web\TranscriptSearchController;
use App\Http\Controllers\Web\TwilioOAuthController;
use App\Http\Controllers\Web\VoiceController;
use App\Http\Controllers\Web\VoiceSettingsController;
use App\Http\Controllers\Web\WebhookDeliveryController;
use App\Http\Controllers\Web\WebhookDestinationController;
use App\Http\Controllers\Webhooks\HubSpotWebhookController;
use App\Http\Controllers\Webhooks\N8nWebhookController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/locale/{locale}', function (string $locale) {
    $supported = array_keys(config('locales'));

    if (in_array($locale, $supported, true)) {
        session(['locale' => $locale]);
        App::setLocale($locale);
    }

    return redirect()->back();
})->name('locale.switch');

Route::post('twilio/inbound', [WebhookController::class, 'inbound'])->middleware('twilio.verify');
Route::post('twilio/step', [WebhookController::class, 'step'])
    ->middleware('twilio.verify')
    ->name('twilio.step');
Route::post('twilio/status', [WebhookController::class, 'status'])->middleware('twilio.verify');
Route::post('twilio/gather', [WebhookController::class, 'gather'])->middleware('twilio.verify');
Route::post('twilio/recording', [WebhookController::class, 'recording'])->middleware('twilio.verify');
Route::post('twilio/consent-callback', [WebhookController::class, 'consentCallback'])
    ->middleware('twilio.verify')
    ->name('twilio.consent-callback');
Route::post('twilio/sms/inbound', [TwilioSmsController::class, 'inbound'])->middleware('throttle:twilio');

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('stripe.webhook');
Route::post('/webhooks/n8n/{tenant}', N8nWebhookController::class)
    ->middleware('throttle:60,1')
    ->name('webhooks.n8n');
Route::post('/webhooks/hubspot', HubSpotWebhookController::class)
    ->middleware('throttle:60,1')
    ->name('webhooks.hubspot');

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/dashboard/export/csv', [DashboardController::class, 'exportAnalytics'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.export.analytics');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/search', SearchController::class)->name('search');

    Route::get('/flows', [FlowController::class, 'index'])->name('flows.index');
    Route::get('/flows/create', [FlowController::class, 'create'])->name('flows.create');
    Route::post('/flows', [FlowController::class, 'store'])->name('flows.store');
    Route::get('/flows/{flow}/edit', [FlowController::class, 'edit'])->name('flows.edit');
    Route::get('/flows/{flow}', [FlowController::class, 'show'])->name('flows.show');
    Route::patch('/flows/{flow}', [FlowController::class, 'update'])->name('flows.update');
    Route::post('/flows/{flow}/test', [FlowController::class, 'test'])->name('flows.test');
    Route::get('/flows/{flow}/simulate', [FlowTestController::class, 'simulate'])->name('flows.simulate');
    Route::post('/flows/{flow}/duplicate', [FlowController::class, 'duplicate'])->name('flows.duplicate');
    Route::get('/flows/{flow}/export', [FlowController::class, 'export'])->name('flows.export');
    Route::post('/flows/import', [FlowController::class, 'import'])->name('flows.import');
    Route::delete('/flows/{flow}', [FlowController::class, 'destroy'])->name('flows.destroy');
    Route::get('/flows/{flow}/comments', [FlowCommentController::class, 'index'])->name('flows.comments.index');
    Route::post('/flows/{flow}/comments', [FlowCommentController::class, 'store'])->name('flows.comments.store');
    Route::get('/flows/{flow}/versions', [FlowController::class, 'versions'])->name('flows.versions');
    Route::post('/flows/{flow}/versions/{version}/restore', [FlowController::class, 'restore'])->name('flows.versions.restore');

    Route::get('/transcripts', [TranscriptSearchController::class, 'index'])->name('transcripts.index');
    Route::get('/transcripts/export/csv', [TranscriptSearchController::class, 'export'])->name('transcripts.export');

    Route::get('/calls/scheduled', [ScheduledCallController::class, 'index'])->name('calls.scheduled');
    Route::post('/calls/scheduled', [ScheduledCallController::class, 'store'])->name('calls.scheduled.store');
    Route::patch('/calls/scheduled/{scheduled_call}/cancel', [ScheduledCallController::class, 'cancel'])->name('calls.scheduled.cancel');
    Route::delete('/calls/scheduled/{scheduled_call}', [ScheduledCallController::class, 'destroy'])->name('calls.scheduled.destroy');

    Route::get('/calls', [CallController::class, 'index'])->name('calls.index');
    Route::get('/calls/export/csv', [CallController::class, 'exportCsv'])->name('calls.export');
    Route::get('/calls/{call}', [CallController::class, 'show'])->name('calls.show');
    Route::get('/recordings/{call}/play', [RecordingController::class, '__invoke'])->name('recordings.play');
    Route::patch('/calls/{call}/notes', [CallController::class, 'updateNotes'])->name('calls.notes');
    Route::post('/calls/{call}/retry', [CallController::class, 'retry'])->name('calls.retry');
    Route::delete('/calls/{call}', [CallController::class, 'destroy'])->name('calls.destroy');

    Route::get('/monitor', [MonitorController::class, 'index'])->name('monitor.index');
    Route::get('/monitor/active', [MonitorController::class, 'active'])->name('monitor.active');
    Route::get('/monitor/calls/{call}/transcript', [MonitorController::class, 'transcript'])->name('monitor.transcript');

    Route::get('/sms', [SmsController::class, 'index'])->name('sms.index');
    Route::get('/sms/conversation/{contactNumber}', [SmsController::class, 'conversation'])->name('sms.conversation');
    Route::post('/sms/send', [SmsController::class, 'send'])->name('sms.send');

    Route::get('/sms/auto-replies', [SmsAutoReplyController::class, 'index'])->name('sms.auto-replies.index');
    Route::post('/sms/auto-replies', [SmsAutoReplyController::class, 'store'])->name('sms.auto-replies.store');
    Route::patch('/sms/auto-replies/{sms_auto_reply}', [SmsAutoReplyController::class, 'update'])->name('sms.auto-replies.update');
    Route::delete('/sms/auto-replies/{sms_auto_reply}', [SmsAutoReplyController::class, 'destroy'])->name('sms.auto-replies.destroy');

    Route::get('/sms/campaigns', [SmsCampaignController::class, 'index'])->name('sms.campaigns.index');
    Route::post('/sms/campaigns', [SmsCampaignController::class, 'store'])->name('sms.campaigns.store');
    Route::post('/sms/campaigns/{sms_campaign}/send', [SmsCampaignController::class, 'send'])->name('sms.campaigns.send');
    Route::delete('/sms/campaigns/{sms_campaign}', [SmsCampaignController::class, 'destroy'])->name('sms.campaigns.destroy');

    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::patch('/billing/plan', [BillingController::class, 'updatePlan'])->name('billing.update');
    Route::post('/billing/checkout', [StripeController::class, 'checkout'])->name('billing.checkout');
    Route::post('/billing/portal', [StripeController::class, 'portal'])->name('billing.portal');

    Route::get('/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    Route::get('/settings/tenant', [TenantSettingsController::class, 'edit'])->name('settings.tenant');
    Route::patch('/settings/tenant', [TenantSettingsController::class, 'update'])->name('settings.tenant.update');

    Route::get('/settings/integrations', [IntegrationsController::class, 'index'])->name('settings.integrations.index');
    Route::get('/settings/integrations/n8n', [N8nIntegrationController::class, 'show'])->name('settings.integrations.n8n');
    Route::post('/settings/integrations/n8n/connect', [N8nIntegrationController::class, 'connect'])->name('settings.integrations.n8n.connect');
    Route::post('/settings/integrations/n8n/disconnect', [N8nIntegrationController::class, 'disconnect'])->name('settings.integrations.n8n.disconnect');
    Route::post('/settings/integrations/n8n/test', [N8nIntegrationController::class, 'test'])->name('settings.integrations.n8n.test');
    Route::post('/settings/integrations/n8n/workflows/{workflowId}/activate', [N8nIntegrationController::class, 'activateWorkflow'])->name('settings.integrations.n8n.activate');
    Route::post('/settings/integrations/n8n/workflows/{workflowId}/deactivate', [N8nIntegrationController::class, 'deactivateWorkflow'])->name('settings.integrations.n8n.deactivate');

    Route::get('/settings/integrations/hubspot', [HubSpotConsoleController::class, 'overview'])->name('settings.integrations.hubspot');
    Route::get('/settings/integrations/hubspot/search', [HubSpotConsoleController::class, 'search'])->name('settings.integrations.hubspot.search');
    Route::post('/settings/integrations/hubspot/connect', [HubSpotIntegrationController::class, 'connect'])->name('settings.integrations.hubspot.connect');
    Route::get('/settings/integrations/hubspot/callback', [HubSpotIntegrationController::class, 'callback'])->name('settings.integrations.hubspot.callback');
    Route::post('/settings/integrations/hubspot/disconnect', [HubSpotIntegrationController::class, 'disconnect'])->name('settings.integrations.hubspot.disconnect');
    Route::post('/settings/integrations/hubspot/sync', [HubSpotIntegrationController::class, 'updateSync'])->name('settings.integrations.hubspot.sync');

    Route::get('/settings/integrations/hubspot/objects/{objectType}', [HubSpotCrmObjectController::class, 'index'])->name('settings.integrations.hubspot.objects.index');
    Route::post('/settings/integrations/hubspot/objects/{objectType}', [HubSpotCrmObjectController::class, 'store'])->name('settings.integrations.hubspot.objects.store');
    Route::post('/settings/integrations/hubspot/objects/{objectType}/batch', [HubSpotCrmObjectController::class, 'batch'])->name('settings.integrations.hubspot.objects.batch');
    Route::get('/settings/integrations/hubspot/objects/{objectType}/{id}', [HubSpotCrmObjectController::class, 'show'])->name('settings.integrations.hubspot.objects.show');
    Route::patch('/settings/integrations/hubspot/objects/{objectType}/{id}', [HubSpotCrmObjectController::class, 'update'])->name('settings.integrations.hubspot.objects.update');
    Route::delete('/settings/integrations/hubspot/objects/{objectType}/{id}', [HubSpotCrmObjectController::class, 'destroy'])->name('settings.integrations.hubspot.objects.destroy');
    Route::post('/settings/integrations/hubspot/objects/{objectType}/{id}/associate', [HubSpotCrmObjectController::class, 'associate'])->name('settings.integrations.hubspot.objects.associate');
    Route::post('/settings/integrations/hubspot/objects/{objectType}/{id}/dissociate', [HubSpotCrmObjectController::class, 'dissociate'])->name('settings.integrations.hubspot.objects.dissociate');

    Route::get('/settings/integrations/hubspot/modules/{module}', [HubSpotModulePageController::class, 'show'])->name('settings.integrations.hubspot.modules.show');
    Route::post('/settings/integrations/hubspot/modules/{module}', [HubSpotModulePageController::class, 'mutate'])->name('settings.integrations.hubspot.modules.mutate');

    Route::get('/settings/integrations/hubspot/voice-sync', [HubSpotVoiceSyncController::class, 'show'])->name('settings.integrations.hubspot.voice-sync');
    Route::post('/settings/integrations/hubspot/voice-sync', [HubSpotVoiceSyncController::class, 'update'])->name('settings.integrations.hubspot.voice-sync.update');
    Route::post('/settings/integrations/hubspot/voice-sync/calls/{callId}', [HubSpotVoiceSyncController::class, 'syncCall'])->name('settings.integrations.hubspot.voice-sync.sync-call');

    Route::get('/settings/integrations/looker-studio', [LookerStudioIntegrationController::class, 'show'])->name('settings.integrations.looker-studio');
    Route::post('/settings/integrations/looker-studio/connect', [LookerStudioIntegrationController::class, 'connect'])->name('settings.integrations.looker-studio.connect');
    Route::post('/settings/integrations/looker-studio/disconnect', [LookerStudioIntegrationController::class, 'disconnect'])->name('settings.integrations.looker-studio.disconnect');
    Route::post('/settings/integrations/looker-studio/bigquery', [LookerStudioIntegrationController::class, 'updateBigQuery'])->name('settings.integrations.looker-studio.bigquery');

    Route::get('/analytics/studio', AnalyticsStudioController::class)->name('analytics.studio');

    Route::get('/twilio/oauth/callback', [TwilioOAuthController::class, 'callback'])
        ->name('twilio.oauth.callback');
    Route::post('/twilio/oauth/disconnect', [TwilioOAuthController::class, 'disconnect'])
        ->name('twilio.oauth.disconnect');

    Route::get('/settings/voice', [VoiceSettingsController::class, 'edit'])->name('settings.voice');
    Route::patch('/settings/voice', [VoiceSettingsController::class, 'update'])->name('settings.voice.update');

    Route::get('/settings/voices', [VoiceController::class, 'index'])->name('settings.voices.index');
    Route::post('/settings/voices', [VoiceController::class, 'store'])->name('settings.voices.store');
    Route::get('/settings/voices/library', [VoiceController::class, 'library'])->name('settings.voices.library');
    Route::post('/settings/voices/library', [VoiceController::class, 'addFromLibrary'])->name('settings.voices.add-from-library');
    Route::delete('/settings/voices/{voice}', [VoiceController::class, 'destroy'])->name('settings.voices.destroy');
    Route::get('/settings/voices/{voice}', [VoiceController::class, 'show'])->name('settings.voices.show');
    Route::patch('/settings/voices/{voice}/default', [VoiceController::class, 'setDefault'])->name('settings.voices.set-default');

    Route::get('/settings/documents', [DocumentsController::class, 'index'])->name('settings.documents.index');
    Route::get('/settings/documents/create', [DocumentsController::class, 'create'])->name('settings.documents.create');
    Route::post('/settings/documents', [DocumentsController::class, 'store'])->name('settings.documents.store');
    Route::get('/settings/documents/{document}', [DocumentsController::class, 'show'])->name('settings.documents.show');
    Route::delete('/settings/documents/{document}', [DocumentsController::class, 'destroy'])->name('settings.documents.destroy');
    Route::post('/settings/documents/{document}/reprocess', [DocumentsController::class, 'reProcess'])->name('settings.documents.reprocess');
    Route::post('/settings/documents/upload', [DocumentsController::class, 'uploadFile'])->name('settings.documents.upload');

    Route::get('/settings/webhooks', [WebhookDestinationController::class, 'index'])->name('settings.webhooks.index');
    Route::post('/settings/webhooks', [WebhookDestinationController::class, 'store'])->name('settings.webhooks.store');
    Route::patch('/settings/webhooks/{webhook}', [WebhookDestinationController::class, 'update'])->name('settings.webhooks.update');
    Route::delete('/settings/webhooks/{webhook}', [WebhookDestinationController::class, 'destroy'])->name('settings.webhooks.destroy');
    Route::post('/settings/webhooks/{webhook}/test', [WebhookDestinationController::class, 'test'])->name('settings.webhooks.test');
    Route::get('/settings/webhooks/deliveries', [WebhookDeliveryController::class, 'index'])->name('settings.webhooks.deliveries');
    Route::get('/settings/webhooks/deliveries/{id}', [WebhookDeliveryController::class, 'show'])->name('settings.webhooks.deliveries.show');
    Route::post('/settings/webhooks/deliveries/{id}/retry', [WebhookDeliveryController::class, 'retry'])->name('settings.webhooks.deliveries.retry');

    Route::get('/settings/activity', [ActivityLogController::class, 'index'])->name('settings.activity.index');

    Route::get('/settings/errors', [ErrorMonitoringController::class, 'index'])->name('settings.errors.index');
    Route::get('/settings/errors/{hash}', [ErrorMonitoringController::class, 'show'])->name('settings.errors.show');
    Route::patch('/settings/errors/{hash}/resolve', [ErrorMonitoringController::class, 'resolve'])->name('settings.errors.resolve');

    Route::post('/settings/elevenlabs/connect', [ElevenLabsConnectController::class, 'connect'])
        ->name('settings.elevenlabs.connect');
    Route::get('/settings/elevenlabs/status', [ElevenLabsConnectController::class, 'status'])
        ->name('settings.elevenlabs.status');

    Route::get('/settings/agents', [ElevenLabsAgentController::class, 'index'])->name('settings.agents.index');
    Route::post('/settings/agents', [ElevenLabsAgentController::class, 'store'])->name('settings.agents.store');
    Route::patch('/settings/agents/{agent}', [ElevenLabsAgentController::class, 'update'])->name('settings.agents.update');
    Route::delete('/settings/agents/{agent}', [ElevenLabsAgentController::class, 'destroy'])->name('settings.agents.destroy');
    Route::post('/settings/agents/sync', [ElevenLabsAgentController::class, 'syncFromApi'])->name('settings.agents.sync');

    Route::get('/team', [TeamMemberController::class, 'index'])->name('team.index');
    Route::post('/team/invite', [TeamMemberController::class, 'invite'])->name('team.invite');
    Route::patch('/team/{user}/role', [TeamMemberController::class, 'update'])->name('team.update');
    Route::delete('/team/{user}', [TeamMemberController::class, 'destroy'])->name('team.destroy');
    Route::get('/team/{user}/permissions', [TeamMemberController::class, 'permissions'])->name('team.permissions');
    Route::patch('/team/{user}/permissions', [TeamMemberController::class, 'updatePermissions'])->name('team.permissions.update');

    Route::post('/admin/impersonate/{user}', [ImpersonationController::class, 'start'])->name('admin.impersonate.start');
    Route::post('/admin/stop-impersonating', [ImpersonationController::class, 'stop'])->name('admin.impersonate.stop');

    Route::get('/settings/data-protection', [DataProtectionController::class, 'edit'])
        ->name('settings.data-protection');
    Route::patch('/settings/data-protection', [DataProtectionController::class, 'update'])
        ->name('settings.data-protection.update');

    Route::get('/settings/privacy', [PrivacyController::class, 'index'])
        ->name('settings.privacy');

    Route::get('/settings/phone-numbers', [PhoneNumberController::class, 'index'])->name('settings.phone-numbers');
    Route::get('/settings/phone-numbers/search', [PhoneNumberController::class, 'search'])->name('settings.phone-numbers.search');
    Route::post('/settings/phone-numbers/buy', [PhoneNumberController::class, 'buy'])->name('settings.phone-numbers.buy');
    Route::delete('/settings/phone-numbers/release', [PhoneNumberController::class, 'release'])->name('settings.phone-numbers.release');

    Route::get('/settings/system', [SystemHealthController::class, 'index'])
        ->name('settings.system');

    Route::get('/settings/system/poll', [SystemHealthController::class, 'poll'])
        ->name('settings.system.poll');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/export/csv', [AnalyticsController::class, 'export'])->name('analytics.export');

    Route::get('/settings/roles', [RoleController::class, 'index'])
        ->name('settings.roles');
    Route::patch('/settings/roles/{role}', [RoleController::class, 'update'])
        ->name('settings.roles.update');

    Route::get('/quality', [QualityController::class, 'index'])->name('quality.index');
    Route::get('/quality/{call}', [QualityController::class, 'show'])->name('quality.show');

    Route::get('/getting-started', [GettingStartedController::class, 'index'])
        ->name('getting-started');
    Route::post('/getting-started/completed', [GettingStartedController::class, 'complete'])
        ->name('getting-started.complete');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');

    Route::delete('/api/tenant/data', [DataDeletionController::class, 'destroy'])
        ->name('api.tenant.data.delete');
    Route::get('/api/tenant/data/export', [DataExportController::class, 'export'])
        ->name('api.tenant.data.export');
});

Route::get('/invite/{token}', AcceptInviteController::class)->name('invite.accept');

require __DIR__.'/auth.php';
