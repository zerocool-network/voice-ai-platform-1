import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import billing from '@/routes/billing';

export default function Index({ tenant, currentPlan, plans, checkout, flash = null }) {
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
            <Head title="Billing" />

            <div>
                <Heading>Billing &amp; Plans</Heading>
                <Text className="mt-1">
                    You are currently on the <strong>{currentPlan.name}</strong> plan.
                </Text>
            </div>

            {checkout === 'success' && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                    <Text className="text-emerald-700 dark:text-emerald-300">
                        Subscription updated! Changes may take a moment to appear.
                    </Text>
                </div>
            )}

            {checkout === 'cancelled' && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                    <Text className="text-amber-700 dark:text-amber-300">
                        Checkout was cancelled. Your plan has not been changed.
                    </Text>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-xl border p-6 transition-shadow ${
                            isCurrent(plan.id)
                                ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500 dark:border-indigo-400'
                                : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        {isCurrent(plan.id) && (
                            <Badge color="indigo" className="absolute -top-2.5 right-4">
                                Current
                            </Badge>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{plan.name}</h3>
                            <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
                                {plan.price}
                                <span className="text-sm font-normal text-zinc-500">/month</span>
                            </p>
                        </div>

                        <ul className="mt-6 flex-1 space-y-3">
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.calls}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.flows}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.team}
                            </li>
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6">
                            {plan.id === 'free' ? (
                                isCurrent('free') ? (
                                    <Button className="w-full" color="zinc" disabled>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button className="w-full" color="zinc" onClick={() => manageBilling()}>
                                        Downgrade via Portal
                                    </Button>
                                )
                            ) : isCurrent(plan.id) ? (
                                <Button className="w-full" color="zinc" onClick={() => manageBilling()}>
                                    Manage Billing
                                </Button>
                            ) : (
                                <Button className="w-full" color="indigo" onClick={() => upgrade(plan.id)}>
                                    Upgrade to {plan.name}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <Button color="zinc/25" onClick={() => manageBilling()}>
                    Manage Payment Methods &amp; Invoices
                </Button>
            </div>
        </AuthenticatedLayout>
    );
}
