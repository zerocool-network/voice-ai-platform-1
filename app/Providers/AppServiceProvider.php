<?php

namespace App\Providers;

use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use App\Domain\Knowledge\Services\ChunkingService;
use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Domain\Voice\Repositories\CustomVoiceRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Call\EloquentCallRepository;
use App\Infrastructure\Persistence\Eloquent\Flow\EloquentFlowRepository;
use App\Infrastructure\Persistence\Eloquent\Knowledge\EloquentChunkRepository;
use App\Infrastructure\Persistence\Eloquent\Knowledge\EloquentDocumentRepository;
use App\Infrastructure\Persistence\Eloquent\Tenant\EloquentTenantRepository;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Infrastructure\Persistence\Eloquent\Voice\CustomVoiceModel;
use App\Infrastructure\Persistence\Eloquent\Voice\EloquentCustomVoiceRepository;
use App\Infrastructure\Services\ElevenLabsAgentService;
use App\Infrastructure\Services\FakeAiService;
use App\Infrastructure\Services\Knowledge\OpenAIEmbeddingService;
use App\Infrastructure\Services\OpenAiService;
use App\Infrastructure\Services\TwilioAiService;
use App\Listeners\UserActivitySubscriber;
use App\Models\User;
use App\Observers\TenantObserver;
use App\Services\TenantEncryptionService;
use App\Services\TwilioOAuthService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;
use Twilio\Rest\Client;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TenantRepositoryInterface::class, EloquentTenantRepository::class);
        $this->app->bind(FlowRepositoryInterface::class, EloquentFlowRepository::class);
        $this->app->bind(CallRepositoryInterface::class, EloquentCallRepository::class);
        $this->app->bind(DocumentRepositoryInterface::class, EloquentDocumentRepository::class);
        $this->app->bind(KnowledgeChunkRepositoryInterface::class, EloquentChunkRepository::class);
        $this->app->bind(CustomVoiceRepositoryInterface::class, fn () => new EloquentCustomVoiceRepository(new CustomVoiceModel));

        if (config('services.openai.api_key')) {
            $this->app->bind(EmbeddingServiceInterface::class, function () {
                return new OpenAIEmbeddingService(
                    apiKey: config('services.openai.api_key'),
                );
            });
        } else {
            $this->app->bind(EmbeddingServiceInterface::class, function () {
                return new class implements EmbeddingServiceInterface
                {
                    public function embed(string $text): array
                    {
                        return array_fill(0, 1536, 0.0);
                    }

                    public function embedMany(array $texts): array
                    {
                        return array_fill(0, count($texts), array_fill(0, 1536, 0.0));
                    }
                };
            });
        }

        $this->app->singleton(ChunkingService::class);
        $this->app->singleton(KnowledgeRetrievalService::class);
        $this->app->singleton(TwilioOAuthService::class);
        $this->app->singleton(TenantEncryptionService::class);

        $this->app->bind(Client::class, function () {
            return new Client(
                config('twilio.account_sid'),
                config('twilio.auth_token'),
            );
        });

        $this->app->bind(AiServiceInterface::class, function () {
            $assistantSid = config('twilio.ai_assistant_sid');

            if ($assistantSid !== null && $assistantSid !== '') {
                return new TwilioAiService(
                    accountSid: config('twilio.account_sid'),
                    authToken: config('twilio.auth_token'),
                    assistantSid: $assistantSid,
                );
            }

            $agentId = config('elevenlabs.agent_id');

            if ($agentId !== null && $agentId !== '') {
                return new ElevenLabsAgentService(
                    apiKey: config('elevenlabs.api_key'),
                    agentId: $agentId,
                );
            }

            $apiKey = config('services.openai.api_key');

            if ($apiKey !== null && $apiKey !== '') {
                return new OpenAiService(
                    apiKey: $apiKey,
                );
            }

            return new FakeAiService;
        });
    }

    public function boot(): void
    {
        Gate::define('viewAuditLog', fn (User $user) => $user->hasPermissionTo('audit.view') || $user->isOwnerOrAdmin());
        Gate::define('manageFlows', fn (User $user) => $user->hasPermissionTo('flows.manage'));
        Gate::define('createFlows', fn (User $user) => $user->hasPermissionTo('flows.create'));
        Gate::define('deleteFlows', fn (User $user) => $user->hasPermissionTo('flows.delete'));
        Gate::define('manageTeam', fn (User $user) => $user->hasPermissionTo('team.manage'));
        Gate::define('viewBilling', fn (User $user) => $user->hasPermissionTo('billing.view'));
        Gate::define('manageBilling', fn (User $user) => $user->hasPermissionTo('billing.manage'));
        Gate::define('exportCalls', fn (User $user) => $user->hasPermissionTo('calls.export'));
        Gate::define('manageWebhooks', fn (User $user) => $user->hasPermissionTo('webhooks.manage'));
        Gate::define('manageAgents', fn (User $user) => $user->hasPermissionTo('agents.manage'));
        Gate::define('manageSettings', fn (User $user) => $user->hasPermissionTo('settings.manage') || $user->isOwnerOrAdmin());
        Gate::define('viewHubSpot', fn (User $user) => $user->tenant_id !== null);
        Gate::define('manageHubSpot', fn (User $user) => $user->isOwner() || $user->isAdmin() || $user->hasPermissionTo('settings.manage'));

        Event::subscribe(UserActivitySubscriber::class);

        TenantModel::observe(TenantObserver::class);

        Cashier::useCustomerModel(TenantModel::class);

        Vite::prefetch(concurrency: 3);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('api_tenant', function (Request $request) {
            return Limit::perMinute(100)->by($request->user()?->tenant_id ?: $request->ip());
        });

        RateLimiter::for('twilio', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('From') ?: $request->ip());
        });

        RateLimiter::for('web', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        if (app()->environment('local', 'development')) {
            Model::preventLazyLoading();
        }
    }
}
