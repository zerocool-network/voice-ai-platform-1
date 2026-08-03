import { useState, useEffect, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/Components/catalyst/button'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { complete } from '@/actions/App/Http/Controllers/Web/GettingStartedController'
import { tenant as settingsTenant, phoneNumbers } from '@/routes/settings'
import { index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController'
import { Phone, MessageSquare, Headphones, GitBranch, Play, CheckCircle2, ArrowRight, Plug, Workflow, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Index({ twilioConnected, elevenlabsConnected, hasPhone, hasFlow, n8nConnected, hubspotConnected, lookerConnected }) {
    const { t } = useTranslation()
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState('next')

    const STEPS = useMemo(() => [
        {
            key: 'twilio',
            title: t('ui.step_connect_twilio'),
            details: t('ui.step_twilio_details'),
            icon: Phone,
            link: settingsTenant().url,
            linkLabel: t('ui.configure_twilio'),
            doneMessage: t('ui.twilio_connected'),
        },
        {
            key: 'elevenlabs',
            title: t('ui.step_connect_elevenlabs'),
            details: t('ui.step_elevenlabs_details'),
            icon: MessageSquare,
            link: settingsTenant().url,
            linkLabel: t('ui.configure_elevenlabs'),
            doneMessage: t('ui.elevenlabs_connected'),
        },
        {
            key: 'phone',
            title: t('ui.step_buy_number'),
            details: t('ui.step_phone_details'),
            icon: Headphones,
            link: phoneNumbers().url,
            linkLabel: t('ui.manage_phone_numbers'),
            doneMessage: t('ui.phone_number_active'),
        },
        {
            key: 'flow',
            title: t('ui.step_create_flow'),
            details: t('ui.step_flow_details'),
            icon: GitBranch,
            link: flowsIndex().url,
            linkLabel: t('ui.create_flow'),
            doneMessage: t('ui.flow_created'),
        },
        {
            key: 'n8n',
            title: t('integrations.n8n_title'),
            details: t('integrations.n8n_desc'),
            icon: Workflow,
            link: '/settings/integrations/n8n',
            linkLabel: t('integrations.configure'),
            doneMessage: t('integrations.n8n_title'),
        },
        {
            key: 'hubspot',
            title: t('integrations.hubspot_title'),
            details: t('integrations.hubspot_desc'),
            icon: Plug,
            link: '/settings/integrations/hubspot',
            linkLabel: t('integrations.configure'),
            doneMessage: t('integrations.hubspot_title'),
        },
        {
            key: 'looker',
            title: t('integrations.looker_title'),
            details: t('integrations.looker_desc'),
            icon: BarChart3,
            link: '/settings/integrations/looker-studio',
            linkLabel: t('integrations.configure'),
            doneMessage: t('integrations.looker_title'),
        },
        {
            key: 'test',
            title: t('ui.step_test_call'),
            details: t('ui.step_test_details'),
            icon: Play,
            link: null,
            linkLabel: null,
            doneMessage: t('ui.ready_to_test'),
        },
    ], [t])

    const stepStatus = [twilioConnected, elevenlabsConnected, hasPhone, hasFlow, n8nConnected, hubspotConnected, lookerConnected, false]
    const completedCount = stepStatus.filter(Boolean).length
    const allDone = completedCount >= 3

    useEffect(() => {
        setCurrentStep(Math.min(currentStep, STEPS.length - 1))
    }, [STEPS.length, currentStep])

    function goNext() {
        setDirection('next')
        setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1))
    }

    function goPrev() {
        setDirection('prev')
        setCurrentStep((p) => Math.max(p - 1, 0))
    }

    function handleFinish() {
        router.post(complete().url)
    }

    const step = STEPS[currentStep]
    const StepIcon = step.icon
    const done = stepStatus[currentStep]

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Head title={t('ui.getting_started_title')} />

            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{t('ui.getting_started_title')}</h1>
                    <Text className="mt-2">{t('ui.getting_started_subtitle')}</Text>
                </div>

                <div className="mb-8 flex items-center justify-center gap-1">
                    {STEPS.map((s, i) => (
                        <div key={s.key} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => { setDirection(i > currentStep ? 'next' : 'prev'); setCurrentStep(i) }}
                                aria-label={t('ui.step_aria', { num: i + 1, title: s.title })}
                                aria-current={i === currentStep ? 'step' : undefined}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                                    i === currentStep
                                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                        : stepStatus[i]
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {stepStatus[i] ? <CheckCircle2 className="size-4" /> : i + 1}
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`mx-1 h-0.5 w-8 rounded-full transition-colors ${
                                    stepStatus[i] ? 'bg-emerald-300' : 'bg-slate-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card transition-all">
                    <div className="mb-4 flex items-center gap-3">
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                            <StepIcon className="size-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {t('ui.step')} {currentStep + 1} {t('ui.of')} {STEPS.length}
                                </Text>
                                {done && <Badge color="emerald">{t('ui.complete')}</Badge>}
                            </div>
                            <h2 className="mt-0.5 text-lg font-semibold text-slate-950">{step.title}</h2>
                        </div>
                    </div>

                    <Text className="text-sm leading-relaxed text-slate-600">{step.details}</Text>

                    {done && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            <p className="text-sm font-medium text-emerald-700">
                                {step.doneMessage}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <Button plain disabled={currentStep === 0} onClick={goPrev}>
                            {t('ui.previous')}
                        </Button>
                        <div className="flex items-center gap-2">
                            {currentStep < STEPS.length - 1 ? (
                                <>
                                    {step.link && (
                                        <Button plain href={step.link}>
                                            {step.linkLabel}
                                            <ArrowRight className="size-3" />
                                        </Button>
                                    )}
                                    <Button onClick={goNext}>
                                        {t('ui.next')}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleFinish}>
                                    {allDone ? t('ui.skip_finish') : t('ui.skip_finish_alt')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="text-sm text-slate-400 transition-colors hover:text-slate-600"
                        >
                            {completedCount > 0
                                ? t('ui.skip_remaining_count', { completed: completedCount, total: STEPS.length })
                                : t('ui.skip_dashboard')}
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Text className="text-xs text-slate-400">
                        {t('ui.steps_completed', { completed: completedCount, total: STEPS.length })}
                    </Text>
                    <div className="mx-auto mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
