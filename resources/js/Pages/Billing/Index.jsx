import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router } from '@inertiajs/react';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import billing from '@/routes/billing';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({ tenant, currentPlan, plans, checkout, flash = null }) {
    const { t } = useTranslation();

    useEffect(() => {
        if (flash?.success || checkout === 'success') {
            // Flash is handled by Inertia; checkout param shows success message
        }
    }, []);

    function upgrade(planId) {
        router.post(billing.checkout().url, { plan: planId });
    }

    function manageBilling() {
        router.post(billing.portal().url);
    }

    function isCurrent(planId) {
        return tenant.plan === planId;
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.billing_plans')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.billing_plans')}
                    subtitle={t('ui.current_plan_text', { plan: currentPlan.name })}
                />

                {checkout === 'success' && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <Text className="text-emerald-700">
                            {t('ui.subscription_updated')}
                        </Text>
                    </div>
                )}

                {checkout === 'cancelled' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <Text className="text-amber-700">
                            {t('ui.checkout_cancelled')}
                        </Text>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-6 shadow-card transition-shadow ${
                                isCurrent(plan.id)
                                    ? 'border-indigo-500 ring-1 ring-indigo-500'
                                    : 'border-slate-200/70 bg-white'
                            }`}
                        >
                            {isCurrent(plan.id) && (
                                <Badge color="indigo" className="absolute -top-2.5 right-4">
                                    {t('ui.current')}
                                </Badge>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-slate-950">{plan.name}</h3>
                                <p className="mt-2 text-3xl font-bold text-slate-950">
                                    {plan.price}
                                    <span className="text-sm font-normal text-slate-500">{t('ui.per_month')}</span>
                                </p>
                            </div>

                            <ul className="mt-6 flex-1 space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    {plan.calls}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    {plan.flows}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    {plan.team}
                                </li>
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6">
                                {plan.id === 'free' ? (
                                    isCurrent('free') ? (
                                        <Button className="w-full" color="zinc" disabled>
                                            {t('ui.current_plan')}
                                        </Button>
                                    ) : (
                                        <Button className="w-full" color="zinc" onClick={() => manageBilling()}>
                                            {t('ui.downgrade_portal')}
                                        </Button>
                                    )
                                ) : isCurrent(plan.id) ? (
                                    <Button className="w-full" color="zinc" onClick={() => manageBilling()}>
                                        {t('ui.manage_billing')}
                                    </Button>
                                ) : (
                                    <Button className="w-full" color="indigo" onClick={() => upgrade(plan.id)}>
                                        {t('ui.upgrade_to', { plan: plan.name })}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Button color="zinc/25" onClick={() => manageBilling()}>
                        {t('ui.manage_payment_invoices')}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
