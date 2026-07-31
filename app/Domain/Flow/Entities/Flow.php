<?php

namespace App\Domain\Flow\Entities;

use App\Domain\Flow\ValueObjects\FlowConfig;

class Flow
{
    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private string $name,
        private ?string $description,
        private ?string $phoneNumber,
        private FlowConfig $config,
        private bool $isActive = true,
        private int $version = 1,
        private string $language = 'en-US',
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function id(): string
    {
        return $this->id;
    }

    public function getTenantId(): string
    {
        return $this->tenantId;
    }

    public function tenantId(): string
    {
        return $this->tenantId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function phoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    /** @return array<string, mixed> */
    public function getConfig(): array
    {
        return $this->config->toArray();
    }

    public function config(): FlowConfig
    {
        return $this->config;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function language(): string
    {
        return $this->language;
    }
}
