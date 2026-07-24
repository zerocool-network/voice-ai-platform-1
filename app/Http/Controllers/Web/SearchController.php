<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (mb_strlen(trim($q)) < 2) {
            return response()->json(['data' => []]);
        }

        $tenantId = $request->user()->tenant_id;

        $calls = CallModel::search($q)
            ->query(fn ($q) => $q->where('tenant_id', $tenantId))
            ->take(5)
            ->get()
            ->map(fn ($m) => [
                'type' => 'call',
                'id' => $m->id,
                'title' => "{$m->from_number} → {$m->to_number}",
                'subtitle' => $m->call_sid,
                'status' => $m->status,
                'url' => "/calls/{$m->id}",
            ]);

        $flows = FlowModel::search($q)
            ->query(fn ($q) => $q->where('tenant_id', $tenantId))
            ->take(5)
            ->get()
            ->map(fn ($m) => [
                'type' => 'flow',
                'id' => $m->id,
                'title' => $m->name,
                'subtitle' => $m->is_active ? 'Active' : 'Inactive',
                'status' => $m->is_active ? 'active' : 'inactive',
                'url' => "/flows/{$m->id}",
            ]);

        $sms = SmsMessageModel::search($q)
            ->query(fn ($q) => $q->where('tenant_id', $tenantId))
            ->take(5)
            ->get()
            ->map(fn ($m) => [
                'type' => 'sms',
                'id' => $m->id,
                'title' => "{$m->from_number} → {$m->to_number}",
                'subtitle' => mb_strimwidth($m->body, 0, 80, '...'),
                'status' => $m->status,
                'url' => '/sms',
            ]);

        $transcripts = TranscriptModel::search($q)
            ->query(fn ($q) => $q->whereHas('call', fn ($cq) => $cq->where('tenant_id', $tenantId)))
            ->take(5)
            ->get()
            ->map(fn ($m) => [
                'type' => 'transcript',
                'id' => $m->id,
                'title' => "{$m->role}: {$m->text}",
                'subtitle' => $m->call_sid ?? '',
                'status' => null,
                'url' => "/calls/{$m->call_id}",
            ]);

        $results = $calls
            ->concat($flows)
            ->concat($sms)
            ->concat($transcripts)
            ->values();

        return response()->json(['data' => $results]);
    }
}
