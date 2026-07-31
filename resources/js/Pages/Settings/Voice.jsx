import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Volume2, Globe, Gauge, Mic } from 'lucide-react';

export default function Voice({ settings }) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        default_tts_provider: settings.default_tts_provider ?? 'elevenlabs',
        default_language: settings.default_language ?? 'en',
        elevenlabs_voice_id: settings.elevenlabs_voice_id ?? '',
        tts_speed: settings.tts_speed?.toString() ?? '1.0',
        voice_stability: settings.voice_stability?.toString() ?? '0.5',
        voice_similarity_boost: settings.voice_similarity_boost?.toString() ?? '0.75',
    });

    function submit(e) {
        e.preventDefault();
        patch('/settings/voice', {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.voice_title')} />

            <PageHeader
                title={t('ui.voice_title')}
                subtitle={t('ui.voice_subtitle')}
            />

            <div className="mt-8 max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Volume2 className="size-5 text-slate-500" />
                            <Subheading>{t('ui.tts_provider')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.tts_description')}</Text>
                        <div className="mt-4">
                            <Field>
                                <Label>{t('ui.provider_label')}</Label>
                                <Select
                                    value={data.default_tts_provider}
                                    onChange={(e) => setData('default_tts_provider', e.target.value)}
                                    invalid={errors.default_tts_provider ? true : undefined}
                                >
                                    <option value="elevenlabs">{t('ui.elevenlabs_provider')}</option>
                                    <option value="twilio">{t('ui.twilio_polly_provider')}</option>
                                </Select>
                                {errors.default_tts_provider && <ErrorMessage>{errors.default_tts_provider}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-slate-500" />
                            <Subheading>{t('ui.language')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.language_description')}</Text>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>{t('ui.default_language')}</Label>
                                <Select
                                    value={data.default_language}
                                    onChange={(e) => setData('default_language', e.target.value)}
                                    invalid={errors.default_language ? true : undefined}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh">Chinese</option>
                                </Select>
                                {errors.default_language && <ErrorMessage>{errors.default_language}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Mic className="size-5 text-slate-500" />
                            <Subheading>{t('ui.elevenlabs_voice')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.voice_description')}</Text>
                        <div className="mt-4">
                            <Field>
                                <Label>{t('ui.voice_id')}</Label>
                                <Input
                                    value={data.elevenlabs_voice_id}
                                    onChange={(e) => setData('elevenlabs_voice_id', e.target.value)}
                                    placeholder="21m00Tcm4TlvDq8ikWAM"
                                    invalid={errors.elevenlabs_voice_id ? true : undefined}
                                />
                                {errors.elevenlabs_voice_id && <ErrorMessage>{errors.elevenlabs_voice_id}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Gauge className="size-5 text-slate-500" />
                            <Subheading>{t('ui.speech_settings')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.speech_description')}</Text>
                        <div className="mt-4 space-y-6">
                            <Field>
                                <Label>{t('ui.speed')} ({data.tts_speed}x)</Label>
                                <Input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={data.tts_speed}
                                    onChange={(e) => setData('tts_speed', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>2.0x</span>
                                </div>
                                {errors.tts_speed && <ErrorMessage>{errors.tts_speed}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>{t('ui.stability')} ({data.voice_stability})</Label>
                                <Input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={data.voice_stability}
                                    onChange={(e) => setData('voice_stability', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{t('ui.flexible')}</span>
                                    <span>{t('ui.stable')}</span>
                                </div>
                                {errors.voice_stability && <ErrorMessage>{errors.voice_stability}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>{t('ui.similarity_boost')} ({data.voice_similarity_boost})</Label>
                                <Input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={data.voice_similarity_boost}
                                    onChange={(e) => setData('voice_similarity_boost', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{t('ui.low')}</span>
                                    <span>{t('ui.high')}</span>
                                </div>
                                {errors.voice_similarity_boost && <ErrorMessage>{errors.voice_similarity_boost}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? t('ui.saving') : t('ui.save_settings')}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
