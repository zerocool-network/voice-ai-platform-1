<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\ElevenLabs\ElevenLabsAgentModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ElevenLabsAgentPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('agents.manage');
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/agents')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/agents')->assertOk();
    }

    public function test_index_shows_empty_state(): void
    {
        $response = $this->actingAs($this->user)->get('/settings/agents');

        $response->assertOk();
    }

    public function test_index_lists_agents(): void
    {
        ElevenLabsAgentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Agent',
            'elevenlabs_agent_id' => 'abc123',
        ]);

        ElevenLabsAgentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Agent',
            'elevenlabs_agent_id' => 'def456',
        ]);

        $response = $this->actingAs($this->user)->get('/settings/agents');

        $response->assertOk();
        $response->assertSee('Test Agent');
        $response->assertSee('Support Agent');
        $response->assertSee('abc123');
        $response->assertSee('def456');
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/Agents/Index')
            ->has('agents', 2)
        );
    }

    public function test_create_requires_api_key(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/agents', ['name' => 'My Agent'])
            ->assertRedirect('/settings/agents');

        $this->assertEquals(0, ElevenLabsAgentModel::count());
    }

    public function test_create_calls_elevenlabs_api(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => 'test-key-123',
        ])]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents/create' => Http::response([
                'agent_id' => 'agent_987',
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->post('/settings/agents', [
                'name' => 'My Agent',
                'system_prompt' => 'You are helpful.',
            ])
            ->assertRedirect('/settings/agents');

        $agent = ElevenLabsAgentModel::where('tenant_id', $this->user->tenant_id)->first();
        $this->assertNotNull($agent);
        $this->assertEquals('My Agent', $agent->name);
        $this->assertEquals('agent_987', $agent->elevenlabs_agent_id);
    }

    public function test_update_agent(): void
    {
        $agent = ElevenLabsAgentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Old Name',
            'elevenlabs_agent_id' => 'agent_123',
            'config' => ['system_prompt' => 'Old prompt'],
        ]);

        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => 'test-key-123',
        ])]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents/agent_123' => Http::response([
                'agent_id' => 'agent_123',
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->patch("/settings/agents/{$agent->id}", [
                'name' => 'Updated Agent',
                'system_prompt' => 'New prompt',
            ])
            ->assertRedirect('/settings/agents');

        $agent->refresh();
        $this->assertEquals('Updated Agent', $agent->name);
    }

    public function test_delete_agent(): void
    {
        $agent = ElevenLabsAgentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'To Delete',
            'elevenlabs_agent_id' => 'agent_456',
        ]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents/agent_456' => Http::response(null, 200),
        ]);

        $this->actingAs($this->user)
            ->delete("/settings/agents/{$agent->id}")
            ->assertRedirect('/settings/agents');

        $this->assertNull($agent->fresh());
    }

    public function test_sync_imports_remote_agents(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => 'test-key-123',
        ])]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents' => Http::response([
                'agents' => [
                    ['agent_id' => 'remote_1', 'name' => 'Remote Agent 1'],
                    ['agent_id' => 'remote_2', 'name' => 'Remote Agent 2'],
                ],
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->post('/settings/agents/sync')
            ->assertRedirect('/settings/agents');

        $agents = ElevenLabsAgentModel::where('tenant_id', $this->user->tenant_id)->get();
        $this->assertCount(2, $agents);
        $this->assertEquals('Remote Agent 1', $agents[0]->name);
        $this->assertEquals('remote_2', $agents[1]->elevenlabs_agent_id);
    }

    public function test_sync_does_not_duplicate_existing_agents(): void
    {
        ElevenLabsAgentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Existing Agent',
            'elevenlabs_agent_id' => 'remote_1',
        ]);

        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => 'test-key-123',
        ])]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents' => Http::response([
                'agents' => [
                    ['agent_id' => 'remote_1', 'name' => 'Existing Agent'],
                    ['agent_id' => 'remote_2', 'name' => 'New Agent'],
                ],
            ], 200),
        ]);

        $this->actingAs($this->user)->post('/settings/agents/sync');

        $agents = ElevenLabsAgentModel::where('tenant_id', $this->user->tenant_id)->get();
        $this->assertCount(2, $agents);
    }

    public function test_sync_requires_api_key(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/agents/sync')
            ->assertRedirect('/settings/agents');
    }

    public function test_sync_handles_api_error(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => 'test-key-123',
        ])]);

        Http::fake([
            'api.elevenlabs.io/v1/convai/agents' => Http::response(null, 500),
        ]);

        $this->actingAs($this->user)
            ->post('/settings/agents/sync')
            ->assertRedirect('/settings/agents');
    }
}
