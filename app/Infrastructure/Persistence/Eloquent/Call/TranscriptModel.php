<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $call_id
 * @property string $role
 * @property string $text
 * @property int|null $start_offset_ms
 * @property int|null $end_offset_ms
 * @property float|null $confidence
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $started_at
 * @property string|null $from_number
 * @property string|null $to_number
 * @property string|null $call_status
 * @property string|null $call_sid
 * @property string|null $flow_name
 */
class TranscriptModel extends Model
{
    use Searchable;

    protected $table = 'transcripts';

    protected $fillable = [
        'call_id',
        'role',
        'text',
        'start_offset_ms',
        'end_offset_ms',
        'confidence',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'confidence' => 'float',
            'start_offset_ms' => 'integer',
            'end_offset_ms' => 'integer',
        ];
    }

    /** @return BelongsTo<CallModel, $this> */
    public function call(): BelongsTo
    {
        return $this->belongsTo(CallModel::class, 'call_id');
    }

    /** @return array<string, mixed> */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'call_id' => $this->call_id,
            'role' => $this->role,
            'text' => $this->text,
            'call_sid' => $this->call_sid,
        ];
    }
}
