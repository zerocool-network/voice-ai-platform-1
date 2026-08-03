<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class FlowsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('flows.manage');
    }

    public function test_flows_index_page_requires_authentication(): void
    {
        $this->get('/flows')->assertRedirect('/login');
    }

    public function test_flows_index_page_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/flows')
            ->assertOk();
    }

    public function test_flows_index_page_shows_flows(): void
    {
        FlowModelFactory::new()->count(3)->create(['tenant_id' => $this->user->tenant_id]);

        $response = $this->actingAs($this->user)->get('/flows');

        $response->assertOk();
        $response->assertSee('Flows');
    }

    public function test_flows_index_page_scoped_to_tenant(): void
    {
        FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'name' => 'My Flow']);
        $otherTenant = TenantFactory::new()->create();
        FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id, 'name' => 'Other Flow']);

        $response = $this->actingAs($this->user)->get('/flows');

        $response->assertOk();
        $response->assertSee('My Flow');
        $response->assertDontSee('Other Flow');
    }

    public function test_create_page_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/flows/create')
            ->assertOk();
    }

    public function test_create_page_requires_authentication(): void
    {
        $this->get('/flows/create')->assertRedirect('/login');
    }

    public function test_store_creates_flow(): void
    {
        $this->actingAs($this->user)->post('/flows', [
            'name' => 'Test Flow',
            'description' => 'A test flow',
            'language' => 'es-ES',
        ])->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'description' => 'A test flow',
            'language' => 'es-ES',
        ]);
    }

    public function test_store_validates_name(): void
    {
        $this->actingAs($this->user)
            ->post('/flows', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_edit_page_renders(): void
    {
        $flow = FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)
            ->get("/flows/{$flow->id}/edit")
            ->assertOk();
    }

    public function test_edit_page_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->get("/flows/{$flow->id}/edit")
            ->assertNotFound();
    }

    public function test_update_changes_flow(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Original Name',
        ]);

        $this->actingAs($this->user)->patch("/flows/{$flow->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'language' => 'es-MX',
            'is_active' => false,
        ])->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'id' => $flow->id,
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'language' => 'es-MX',
            'is_active' => false,
        ]);
    }

    public function test_update_persists_step_positions_in_config(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'config' => [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['type' => 'say', 'config' => ['text' => 'Hi'], 'next' => null],
                ],
            ],
        ]);

        $config = [
            'start_step' => 's1',
            'steps' => [
                's1' => [
                    'id' => 's1',
                    'type' => 'say',
                    'config' => ['text' => 'Hi'],
                    'next' => null,
                    'position' => ['x' => 320, 'y' => 180],
                ],
            ],
        ];

        $this->actingAs($this->user)->patch("/flows/{$flow->id}", [
            'name' => $flow->name,
            'description' => $flow->description,
            'phone_number' => $flow->phone_number,
            'language' => $flow->language ?? 'en-US',
            'is_active' => $flow->is_active,
            'config' => json_encode($config),
        ])->assertRedirect(route('flows.index'));

        $flow->refresh();

        $this->assertSame(['x' => 320, 'y' => 180], $flow->config['steps']['s1']['position']);
    }

    public function test_update_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->patch("/flows/{$flow->id}", ['name' => 'Hacked'])
            ->assertNotFound();
    }

    public function test_destroy_deletes_flow(): void
    {
        $flow = FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)
            ->delete("/flows/{$flow->id}")
            ->assertRedirect(route('flows.index'));

        $this->assertDatabaseMissing('flows', ['id' => $flow->id]);
    }

    public function test_destroy_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->delete("/flows/{$flow->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('flows', ['id' => $flow->id]);
    }

    public function test_duplicate_creates_copy(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Original Flow',
            'description' => 'Original description',
            'config' => ['start_step' => 's1', 'steps' => ['s1' => ['type' => 'say', 'config' => ['text' => 'Hi']]]],
        ]);

        $this->actingAs($this->user)
            ->post("/flows/{$flow->id}/duplicate")
            ->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Original Flow (Copy)',
            'description' => 'Original description',
        ]);

        $this->assertDatabaseCount('flows', 2);
    }

    public function test_duplicate_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->post("/flows/{$flow->id}/duplicate")
            ->assertNotFound();
    }

    public function test_duplicate_requires_authentication(): void
    {
        $flow = FlowModelFactory::new()->create();

        $this->post("/flows/{$flow->id}/duplicate")->assertRedirect('/login');
    }

    public function test_export_returns_flow_json(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Export Test',
            'config' => ['start_step' => 's1', 'steps' => ['s1' => ['type' => 'say', 'config' => ['text' => 'Hi']]]],
        ]);

        $response = $this->actingAs($this->user)
            ->get("/flows/{$flow->id}/export")
            ->assertOk()
            ->assertHeader('Content-Type', 'application/json');

        $data = $response->json();
        $this->assertSame('Export Test', $data['name']);
        $this->assertSame('s1', $data['config']['start_step']);
        $this->assertSame(1, $data['export_version']);
        $this->assertArrayHasKey('exported_at', $data);
    }

    public function test_export_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->get("/flows/{$flow->id}/export")
            ->assertNotFound();
    }

    public function test_export_requires_authentication(): void
    {
        $flow = FlowModelFactory::new()->create();

        $this->get("/flows/{$flow->id}/export")->assertRedirect('/login');
    }

    public function test_import_creates_flow_from_json(): void
    {
        $file = UploadedFile::fake()->createWithContent('flow.json', json_encode([
            'name' => 'Imported Flow',
            'description' => 'Imported description',
            'phone_number' => '+1234567890',
            'config' => ['start_step' => 's1', 'steps' => ['s1' => ['type' => 'say', 'config' => ['text' => 'Hello']]]],
        ]));

        $this->actingAs($this->user)
            ->post('/flows/import', ['file' => $file])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Imported Flow',
            'phone_number' => '+1234567890',
            'is_active' => false,
        ]);
    }

    public function test_import_validates_file_format(): void
    {
        $file = UploadedFile::fake()->createWithContent('flow.json', json_encode([
            'name' => 'No Config',
        ]));

        $this->actingAs($this->user)
            ->post('/flows/import', ['file' => $file])
            ->assertSessionHas('error');
    }

    public function test_import_requires_authentication(): void
    {
        $file = UploadedFile::fake()->create('flow.json');

        $this->post('/flows/import', ['file' => $file])->assertRedirect('/login');
    }
}
