<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CallDeleteTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private CallModel $call;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        $this->call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'call_sid' => 'CA_TEST_DELETE',
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
            'status' => 'completed',
        ]);
    }

    public function test_owner_can_delete_call(): void
    {
        $response = $this->actingAs($this->user)
            ->delete(route('calls.destroy', $this->call));

        $response->assertRedirect(route('calls.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('calls', ['id' => $this->call->id]);
    }

    public function test_guest_cannot_delete_call(): void
    {
        $response = $this->delete(route('calls.destroy', $this->call));

        $response->assertRedirect('/login');
        $this->assertDatabaseHas('calls', ['id' => $this->call->id]);
    }

    public function test_cannot_delete_other_tenant_call(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherCall = CallModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
            'call_sid' => 'CA_OTHER',
            'from_number' => '+16661112222',
            'to_number' => '+16663334444',
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('calls.destroy', $otherCall));

        $response->assertStatus(404);
        $this->assertDatabaseHas('calls', ['id' => $otherCall->id]);
    }

    public function test_deleting_call_cascades_related_models(): void
    {
        TranscriptModel::create([
            'call_id' => $this->call->id,
            'role' => 'user',
            'text' => 'Hello',
        ]);

        $this->actingAs($this->user)
            ->delete(route('calls.destroy', $this->call));

        $this->assertDatabaseMissing('calls', ['id' => $this->call->id]);
        $this->assertDatabaseMissing('transcripts', ['call_id' => $this->call->id]);
    }

    public function test_deleting_nonexistent_call_returns_404(): void
    {
        $response = $this->actingAs($this->user)
            ->delete(route('calls.destroy', 'nonexistent-id'));

        $response->assertStatus(404);
    }
}
