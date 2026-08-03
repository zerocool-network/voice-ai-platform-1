import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, Users, GitBranch, User, Radio, Activity } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const iconMap = {
    comment: MessageSquare,
    invite: Users,
    role_change: Users,
    flow_update: GitBranch,
    voice_cloned: Radio,
};

const toneMap = {
    comment: 'bg-sky-50 text-sky-600 ring-sky-200',
    invite: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    role_change: 'bg-amber-50 text-amber-600 ring-amber-200',
    flow_update: 'bg-violet-50 text-violet-600 ring-violet-200',
    voice_cloned: 'bg-cyan-50 text-cyan-600 ring-cyan-200',
};

const MAX_ITEMS = 10;

export default function ActivityFeed() {
    const { t } = useTranslation();
    const tenantId = usePage().props.auth.user?.tenant_id;
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!window.Echo || !tenantId) return;

        try {
            const channel = window.Echo.channel(`tenant.${tenantId}.activity`);

            channel.listen('.team.activity', (event) => {
                setEvents((prev) => [{ ...event, id: Date.now().toString() }, ...prev.slice(0, MAX_ITEMS - 1)]);
            });
        } catch { /* Echo not available */ }
    }, [tenantId]);

    if (events.length === 0) return null;

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/70">
                    <Activity className="size-3.5 text-slate-500" />
                </div>
                <h3 className="text-[13px] font-semibold text-slate-900">{t('ui.team_activity')}</h3>
            </div>
            <div className="divide-y divide-slate-50">
                {events.map((e) => {
                    const Icon = iconMap[e.action] || User;
                    const tone = toneMap[e.action] || 'bg-slate-50 text-slate-600 ring-slate-200';
                    return (
                        <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                            <div className={`mt-0.5 flex size-8 items-center justify-center rounded-lg ring-1 ${tone}`}>
                                <Icon className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-950">{e.user_name}</span>{' '}
                                    {e.description}
                                </p>
                                <p className="mt-0.5 font-metric text-[11px] text-slate-400">
                                    {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
