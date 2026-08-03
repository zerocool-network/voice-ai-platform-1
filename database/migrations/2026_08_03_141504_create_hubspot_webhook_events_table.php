<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hubspot_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id')->index();
            $table->string('portal_id')->index();
            $table->string('subscription_type')->nullable();
            $table->string('object_id')->nullable();
            $table->json('payload');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hubspot_webhook_events');
    }
};
