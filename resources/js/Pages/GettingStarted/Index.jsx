import { useState, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/Components/catalyst/button'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { complete } from '@/actions/App/Http/Controllers/Web/GettingStartedController'
import { tenant as settingsTenant, phoneNumbers } from '@/routes/settings'
import { index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController'
import { Phone, MessageSquare, Headphones, GitBranch, Play, CheckCircle2, ArrowRight } from 'lucide-react'

const STEPS = [
    {
        key: 'twilio',
        title: 'Connect Twilio',
        description: 'Link your Twilio account to handle phone calls and SMS messages.',
        details: 'ZeroVoice uses Twilio for telephony. Connect your account to enable inbound and outbound calling, SMS, and WhatsApp messaging.',
        icon: Phone,
        link: settingsTenant().url,
        linkLabel: 'Configure Twilio',
    },
    {
        key: 'elevenlabs',
        title: 'Connect ElevenLabs',
        description: 'Add AI voice synthesis with your ElevenLabs API key.',
        details: 'ElevenLabs powers natural-sounding AI voices for your flows. Add your API key to unlock premium voice synthesis and conversational AI agents.',
        icon: MessageSquare,
        link: settingsTenant().url,
        linkLabel: 'Configure ElevenLabs',
    },
    {
        key: 'phone',
        title: 'Buy a Phone Number',
        description: 'Purchase a Twilio phone number for your voice AI.',
        details: 'Your voice AI needs a phone number to receive and make calls. Buy one through your Twilio account and assign it here.',
        icon: Headphones,
        link: phoneNumbers().url,
        linkLabel: 'Manage Phone Numbers',
    },
    {
        key: 'flow',
        title: 'Create a Flow',
        description: 'Build your first voice assistant flow.',
        details: 'Flows are the brain of your voice AI. Use the visual builder to design call flows with menus, prompts, recordings, and AI conversations.',
        icon: GitBranch,
        link: flowsIndex().url,
        linkLabel: 'Create Flow',
    },
    {
        key: 'test',
        title: 'Make a Test Call',
        description: 'Call your number to test your voice AI in action.',
        details: 'Dial your assigned Twilio number to test your flow. Monitor active calls and transcripts in real-time from the Monitor page.',
        icon: Play,
        link: null,
        linkLabel: null,
    },
]

export default function Index({ twilioConnected, elevenlabsConnected, hasPhone, hasFlow }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState('next')
    const stepStatus = [twilioConnected, elevenlabsConnected, hasPhone, hasFlow, false]
    const completedCount = stepStatus.filter(Boolean).length
    const allDone = completedCount >= 3

    useEffect(() => {
        setCurrentStep(Math.min(currentStep, STEPS.length - 1))
    }, [])

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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <Head title="Getting Started" />

            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <Heading className="text-2xl">Getting Started</Heading>
                    <Text className="mt-2">Set up your voice AI platform in 5 simple steps.</Text>
                </div>

                <div className="mb-8 flex items-center justify-center gap-1">
                    {STEPS.map((s, i) => (
                        <div key={s.key} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => { setDirection(i > currentStep ? 'next' : 'prev'); setCurrentStep(i) }}
                                aria-label={`Step ${i + 1}: ${s.title}`}
                                aria-current={i === currentStep ? 'step' : undefined}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                                    i === currentStep
                                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                        : stepStatus[i]
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-zinc-100 text-zinc-500'
                                }`}
                            >
                                {stepStatus[i] ? <CheckCircle2 className="size-4" /> : i + 1}
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`mx-1 h-0.5 w-8 rounded-full transition-colors ${
                                    stepStatus[i] ? 'bg-emerald-300' : 'bg-zinc-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all">
                    <div className="mb-4 flex items-center gap-3">
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                            <StepIcon className="size-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Step {currentStep + 1} of {STEPS.length}
                                </Text>
                                {done && <Badge color="emerald">Complete</Badge>}
                            </div>
                            <Heading className="mt-0.5 text-lg">{step.title}</Heading>
                        </div>
                    </div>

                    <Text className="text-sm leading-relaxed text-zinc-600">{step.details}</Text>

                    {done && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            <p className="text-sm font-medium text-emerald-700">
                                {step.key === 'twilio' && 'Twilio connected successfully.'}
                                {step.key === 'elevenlabs' && 'ElevenLabs connected.'}
                                {step.key === 'phone' && 'Phone number active.'}
                                {step.key === 'flow' && 'Flow created.'}
                                {step.key === 'test' && 'Ready to test!'}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <Button plain disabled={currentStep === 0} onClick={goPrev}>
                            Previous
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
                                        Next
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleFinish}>
                                    {allDone ? 'Finish Setup' : 'Skip & Finish'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-zinc-100 pt-4 text-center">
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {completedCount > 0
                                ? `Skip remaining (${completedCount}/${STEPS.length} complete)`
                                : 'Skip setup, go to dashboard'}
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Text className="text-xs text-zinc-400">
                        {completedCount} of {STEPS.length} steps completed
                    </Text>
                    <div className="mx-auto mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-zinc-200">
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
