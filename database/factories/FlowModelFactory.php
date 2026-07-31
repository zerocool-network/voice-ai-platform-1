<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FlowModel>
 */
class FlowModelFactory extends Factory
{
    protected $model = FlowModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'phone_number' => null,
            'language' => 'en-US',
            'config' => [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello from AI Voice Platform'], 'next' => 'hangup'],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ],
            'is_active' => true,
            'version' => 1,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withPhone(string $phone): static
    {
        return $this->state(fn (array $attributes) => [
            'phone_number' => $phone,
        ]);
    }

    public function withConfig(array $config): static
    {
        return $this->state(fn (array $attributes) => [
            'config' => $config,
        ]);
    }

    public function knowledge(): static
    {
        return $this->state(fn (array $attributes) => [
            'config' => [
                'start_step' => 'welcome',
                'steps' => [
                    'welcome' => ['id' => 'welcome', 'type' => 'say', 'config' => ['text' => 'Hello! I can answer questions about our products.'], 'next' => 'knowledge_lookup'],
                    'knowledge_lookup' => ['id' => 'knowledge_lookup', 'type' => 'knowledge', 'config' => ['query' => '{{user_input}}', 'topK' => 3], 'next' => 'llm_response'],
                    'llm_response' => ['id' => 'llm_response', 'type' => 'llm', 'config' => ['systemPrompt' => 'Answer based on the provided knowledge.', 'userPromptTemplate' => '{{knowledge_results}}', 'model' => 'gpt-4o'], 'next' => 'hangup_step'],
                    'hangup_step' => ['id' => 'hangup_step', 'type' => 'hangup', 'config' => []],
                ],
            ],
        ]);
    }

    public function webhook(): static
    {
        return $this->state(fn (array $attributes) => [
            'config' => [
                'start_step' => 'webhook_call',
                'steps' => [
                    'webhook_call' => ['id' => 'webhook_call', 'type' => 'webhook', 'config' => ['url' => 'https://example.com/callback', 'method' => 'POST', 'headers' => ['Content-Type' => 'application/json']], 'next' => 'say_result'],
                    'say_result' => ['id' => 'say_result', 'type' => 'say', 'config' => ['text' => 'Your request has been processed.'], 'next' => 'hangup_step'],
                    'hangup_step' => ['id' => 'hangup_step', 'type' => 'hangup', 'config' => []],
                ],
            ],
        ]);
    }
}
