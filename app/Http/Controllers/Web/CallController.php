<?php

namespace App\Http\Controllers\Web;

use App\Events\CallUpdated;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CallController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select(
                'calls.id',
                'calls.call_sid',
                'calls.from_number',
                'calls.to_number',
                'calls.flow_id',
                'calls.status',
                'calls.duration_seconds',
                'calls.started_at',
                'calls.ended_at',
                'calls.recording_url',
                'calls.created_at',
                'flows.name as flow_name',
            )
            ->orderBy('calls.created_at', 'desc');

        if ($status = $request->get('status')) {
            $query->where('calls.status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('calls.from_number', 'like', "%{$search}%")
                    ->orWhere('calls.to_number', 'like', "%{$search}%")
                    ->orWhere('calls.call_sid', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Calls/Index', [
            'calls' => $query->paginate(15),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $call = CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select('calls.*', 'flows.name as flow_name')
            ->with('callLogs')
            ->with('retryOf')
            ->with('transcripts')
            ->where('calls.id', $id)
            ->firstOrFail();

        return Inertia::render('Calls/Show', [
            'call' => $call,
        ]);
    }

    public function updateNotes(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:10000'],
        ]);

        $updated = CallModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->update(['notes' => $validated['notes']]);

        if ($updated === 0) {
            abort(404);
        }

        return response()->json(['status' => 'saved']);
    }

    public function retry(Request $request, string $id): RedirectResponse
    {
        $original = CallModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        if ($original->status !== 'failed') {
            return redirect()->route('calls.index')
                ->with('success', 'Only failed calls can be retried.');
        }

        $retry = CallModel::create([
            'tenant_id' => $original->tenant_id,
            'flow_id' => $original->flow_id,
            'call_sid' => 'retry-'.Str::uuid(),
            'from_number' => $original->from_number,
            'to_number' => $original->to_number,
            'status' => 'initiated',
            'retry_of_id' => $original->id,
            'context' => $original->context,
        ]);

        activity()
            ->performedOn($retry)
            ->causedBy($request->user())
            ->withProperties([
                'original_call_id' => $original->id,
                'flow_id' => $original->flow_id,
            ])
            ->log('call_retried');

        CallUpdated::dispatch($retry);

        return redirect()->route('calls.index')
            ->with('success', 'Retry call created from failed call.');
    }

    public function exportCsv(Request $request): \Illuminate\Http\Response
    {
        Gate::authorize('exportCalls');
        $query = CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select('calls.*', 'flows.name as flow_name')
            ->orderBy('calls.created_at', 'desc');

        if ($status = $request->get('status')) {
            $query->where('calls.status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('calls.from_number', 'like', "%{$search}%")
                    ->orWhere('calls.to_number', 'like', "%{$search}%")
                    ->orWhere('calls.call_sid', 'like', "%{$search}%");
            });
        }

        $calls = $query->get();

        $headers = [
            'CallSid', 'From', 'To', 'Status', 'Duration', 'Flow',
            'StartedAt', 'EndedAt', 'RecordingUrl', 'RecordingPath', 'Notes',
        ];

        $rows = $calls->map(fn ($c) => [
            $c->call_sid,
            $c->from_number,
            $c->to_number,
            $c->status,
            $c->duration_seconds ?? 0,
            $c->flow_name ?? '',
            $c->started_at?->toIso8601String() ?? '',
            $c->ended_at?->toIso8601String() ?? '',
            $c->recording_url ?? '',
            $c->recording_path ?? '',
            Str::replace("\n", ' ', $c->notes ?? ''),
        ]);

        $csv = $this->arrayToCsv($headers, $rows->toArray());

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="calls-export-'.now()->format('Y-m-d-His').'.csv"',
        ]);
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $call = CallModel::where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->firstOrFail();

        DB::transaction(function () use ($call) {
            $call->transcripts()->delete();
            $call->callLogs()->delete();
            $call->qualityScore()->delete();
            $call->retries()->delete();
            $call->delete();
        });

        return redirect()->route('calls.index')->with('success', 'Call deleted.');
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, string>>  $rows
     */
    private function arrayToCsv(array $headers, array $rows): string
    {
        $out = fopen('php://temp', 'r+');

        fputcsv($out, $headers);

        foreach ($rows as $row) {
            fputcsv($out, $row);
        }

        rewind($out);

        return stream_get_contents($out);
    }
}
