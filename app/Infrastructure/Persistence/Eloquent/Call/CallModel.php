<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Database\Factories\CallModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string|null $flow_id
 * @property string $call_sid
 * @property string $from_number
 * @property string $to_number
 * @property string $direction
 * @property string $status
 * @property int $duration_seconds
 * @property string|null $current_step
 * @property array<string, mixed>|null $context
 * @property string|null $error
 * @property string|null $recording_sid
 * @property string|null $recording_url
 * @property string|null $recording_path
 * @property string|null $notes
 * @property string|null $retry_of_id
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CallModel extends Model
{
    /** @use HasFactory<CallModelFactory> */
    use HasFactory, HasUuids, Searchable;

    protected $table = 'calls';

    protected $fillable = [
        'id',
        'tenant_id',
        'flow_id',
        'call_sid',
        'from_number',
        'to_number',
        'direction',
        'status',
        'duration_seconds',
        'current_step',
        'context',
        'error',
        'recording_sid',
        'recording_url',
        'recording_path',
        'notes',
        'retry_of_id',
        'started_at',
        'ended_at',
    ];

    /** @return BelongsTo<FlowModel, $this> */
    public function flow(): BelongsTo
    {
        return $this->belongsTo(FlowModel::class, 'flow_id');
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }

    /** @return HasMany<CallLogModel, $this> */
    public function callLogs(): HasMany
    {
        return $this->hasMany(CallLogModel::class, 'call_id')->orderBy('created_at');
    }

    /** @return BelongsTo<CallModel, $this> */
    public function retryOf(): BelongsTo
    {
        return $this->belongsTo(CallModel::class, 'retry_of_id');
    }

    /** @return HasMany<CallModel, $this> */
    public function retries(): HasMany
    {
        return $this->hasMany(CallModel::class, 'retry_of_id');
    }

    /** @return HasOne<CallQualityScoreModel, $this> */
    public function qualityScore(): HasOne
    {
        return $this->hasOne(CallQualityScoreModel::class, 'call_id');
    }

    /** @return HasMany<TranscriptModel, $this> */
    public function transcripts(): HasMany
    {
        return $this->hasMany(TranscriptModel::class, 'call_id')->orderBy('start_offset_ms');
    }

    /** @return array<string, mixed> */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'call_sid' => $this->call_sid,
            'from_number' => $this->from_number,
            'to_number' => $this->to_number,
            'status' => $this->status,
            'direction' => $this->direction,
        ];
    }

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'duration_seconds' => 'integer',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }
}
