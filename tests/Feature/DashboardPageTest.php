<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Database\Factories\CallModelFactory;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_dashboard_renders_with_stats(): void
    {
        FlowModelFactory::new()->count(3)->create(['tenant_id' => $this->user->tenant_id]);
        FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'is_active' => false]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats', fn ($stats) => $stats
                ->where('total_flows', 4)
                ->where('active_flows', 3)
                ->etc()
            )
        );
    }

    public function test_dashboard_shows_call_metrics(): void
    {
        CallModelFactory::new()->count(5)->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'completed',
            'duration_seconds' => 120,
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats', fn ($stats) => $stats
                ->where('total_calls', 5)
                ->where('avg_duration_seconds', 120)
                ->etc()
            )
        );
    }

    public function test_dashboard_metrics_are_scoped_to_tenant(): void
    {
        CallModelFactory::new()->count(3)->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'completed',
        ]);
        $otherTenant = TenantFactory::new()->create();
        CallModelFactory::new()->count(10)->create([
            'tenant_id' => $otherTenant->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats', fn ($stats) => $stats
                ->where('total_calls', 3)
                ->etc()
            )
        );
    }

    public function test_dashboard_counts_todays_calls(): void
    {
        CallModelFactory::new()->count(2)->create([
            'tenant_id' => $this->user->tenant_id,
            'started_at' => Carbon::now(),
        ]);
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'started_at' => Carbon::now()->subDays(2),
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats', fn ($stats) => $stats
                ->where('calls_today', 2)
                ->etc()
            )
        );
    }

    public function test_dashboard_counts_active_calls(): void
    {
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'in_progress',
        ]);
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats', fn ($stats) => $stats
                ->where('active_calls', 1)
                ->etc()
            )
        );
    }

    public function test_dashboard_flow_metrics_expose_numeric_success_rate(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Reception',
        ]);
        CallModelFactory::new()->count(2)->create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'status' => 'completed',
            'duration_seconds' => 90,
        ]);
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'status' => 'failed',
            'duration_seconds' => 30,
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('callsByFlowWithMetrics', 1)
            ->where('callsByFlowWithMetrics.0.flow_name', 'Reception')
            ->where('callsByFlowWithMetrics.0.total_calls', 3)
            ->where('callsByFlowWithMetrics.0.success_rate', fn ($rate) => is_float($rate) || is_int($rate))
            ->where('callsByFlowWithMetrics.0.avg_duration', fn ($duration) => is_float($duration) || is_int($duration))
        );
    }
}
