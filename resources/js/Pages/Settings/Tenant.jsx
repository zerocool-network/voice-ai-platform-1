import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import ConnectTwilioButton from '@/Components/ConnectTwilioButton';
import ElevenLabsConnectModal from '@/Components/ElevenLabsConnectModal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Eye, EyeOff, Phone, Key } from 'lucide-react';
import { update } from '@/actions/App/Http/Controllers/Web/TenantSettingsController';
import { disconnect } from '@/actions/App/Http/Controllers/Web/TwilioOAuthController';
import { useTranslation } from '@/hooks/useTranslation';

export default function Tenant({ tenant }) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        name: tenant.name ?? '',
        slug: tenant.slug ?? '',
        timezone: tenant.timezone ?? 'UTC',
        locale: tenant.locale ?? 'en',
        status: tenant.status ?? 'active',
        twilio_account_sid: tenant.twilio_account_sid ?? '',
        twilio_auth_token: tenant.twilio_auth_token ?? '',
        twilio_phone_number: tenant.twilio_phone_number ?? '',
        whatsapp_phone_number: tenant.whatsapp_phone_number ?? '',
        elevenlabs_default_voice_id: tenant.elevenlabs_default_voice_id ?? '',
    });

    const [showTwilioToken, setShowTwilioToken] = useState(false);
    const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);

    function submit(e) {
        e.preventDefault();
        patch(update().url, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.settings_title')} />

            <div className="max-w-2xl space-y-6">
                <PageHeader
                    title={t('ui.settings_title')}
                    subtitle={t('ui.settings_subtitle')}
                />

                <form onSubmit={submit} className="space-y-6">
                    <PageSection>
                        <Subheading>{t('ui.general')}</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>{t('ui.tenant_name')}</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    invalid={errors.name ? true : undefined}
                                />
                                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>{t('ui.slug')}</Label>
                                <Input
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    invalid={errors.slug ? true : undefined}
                                />
                                {errors.slug && <ErrorMessage>{errors.slug}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <Subheading>{t('ui.localization')}</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>{t('ui.timezone')}</Label>
                                <Select
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    invalid={errors.timezone ? true : undefined}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern (US)</option>
                                    <option value="America/Chicago">Central (US)</option>
                                    <option value="America/Denver">Mountain (US)</option>
                                    <option value="America/Los_Angeles">Pacific (US)</option>
                                    <option value="America/Anchorage">Alaska (US)</option>
                                    <option value="Pacific/Honolulu">Hawaii (US)</option>
                                    <option value="Europe/London">London (UK)</option>
                                    <option value="Europe/Madrid">Madrid (EU)</option>
                                </Select>
                                {errors.timezone && <ErrorMessage>{errors.timezone}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>{t('ui.locale')}</Label>
                                <Select
                                    value={data.locale}
                                    onChange={(e) => setData('locale', e.target.value)}
                                    invalid={errors.locale ? true : undefined}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </Select>
                                {errors.locale && <ErrorMessage>{errors.locale}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <Subheading>{t('ui.status_section')}</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>{t('ui.workspace_status')}</Label>
                                <Select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    invalid={errors.status ? true : undefined}
                                >
                                    <option value="active">{t('ui.active')}</option>
                                    <option value="suspended">{t('ui.suspended')}</option>
                                </Select>
                                {errors.status && <ErrorMessage>{errors.status}</ErrorMessage>}
                            </Field>
                        </div>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Phone className="size-5 text-slate-500" />
                            <Subheading>{t('ui.twilio')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.twilio_configure_desc')}</Text>

                        {tenant.twilio_oauth_enabled ? (
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <Badge color="emerald">{t('ui.connected')}</Badge>
                                    <Text>{t('ui.account_connected', { sid: tenant.twilio_account_sid_oauth ?? 'connected', date: tenant.twilio_connected_at ? new Date(tenant.twilio_connected_at).toLocaleDateString() : '' })}</Text>
                                </div>
                                <Button outline onClick={() => router.post(disconnect().url)}>
                                    {t('ui.disconnect')}
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <ConnectTwilioButton href={tenant.connectUrl} />
                                <Field>
                                    <Label>{t('ui.account_sid')}</Label>
                                    <Input
                                        value={data.twilio_account_sid}
                                        onChange={(e) => setData('twilio_account_sid', e.target.value)}
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        invalid={errors.twilio_account_sid ? true : undefined}
                                    />
                                    {errors.twilio_account_sid && <ErrorMessage>{errors.twilio_account_sid}</ErrorMessage>}
                                </Field>

                                <Field>
                                    <Label>{t('ui.auth_token')}</Label>
                                    <div className="relative">
                                        <Input
                                            type={showTwilioToken ? 'text' : 'password'}
                                            value={data.twilio_auth_token}
                                            onChange={(e) => setData('twilio_auth_token', e.target.value)}
                                            placeholder={tenant.twilio_auth_token ? '********' : t('ui.enter_auth_token')}
                                            invalid={errors.twilio_auth_token ? true : undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTwilioToken(!showTwilioToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                            tabIndex={-1}
                                        >
                                            {showTwilioToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {errors.twilio_auth_token && <ErrorMessage>{errors.twilio_auth_token}</ErrorMessage>}
                                </Field>

                                 <Field>
                                    <Label>{t('ui.default_phone')}</Label>
                                    <Input
                                        value={data.twilio_phone_number}
                                        onChange={(e) => setData('twilio_phone_number', e.target.value)}
                                        placeholder="+12345678900"
                                        invalid={errors.twilio_phone_number ? true : undefined}
                                    />
                                    {errors.twilio_phone_number && <ErrorMessage>{errors.twilio_phone_number}</ErrorMessage>}
                                </Field>

                                <Field>
                                    <Label>{t('ui.whatsapp_phone')}</Label>
                                    <Input
                                        value={data.whatsapp_phone_number}
                                        onChange={(e) => setData('whatsapp_phone_number', e.target.value)}
                                        placeholder="+12345678900"
                                        invalid={errors.whatsapp_phone_number ? true : undefined}
                                    />
                                    {errors.whatsapp_phone_number && <ErrorMessage>{errors.whatsapp_phone_number}</ErrorMessage>}
                                </Field>
                            </div>
                        )}
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Key className="size-5 text-slate-500" />
                            <Subheading>{t('ui.elevenlabs')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.elevenlabs_configure_desc')}</Text>

                        {tenant.elevenlabs_connected_at ? (
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <Badge color="emerald">{t('ui.connected')}</Badge>
                                    <Text>{t('ui.tier_label', { tier: tenant.elevenlabs_subscription_tier ?? 'unknown' })}</Text>
                                </div>
                                <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(100, ((tenant.elevenlabs_character_count ?? 0) / (tenant.elevenlabs_character_limit ?? 1)) * 100)}%` }}
                                    />
                                </div>
                                <Text>{t('ui.characters_used', { used: tenant.elevenlabs_character_count ?? 0, limit: tenant.elevenlabs_character_limit ?? 0 })}</Text>
                                <Button outline onClick={() => setShowElevenLabsModal(true)}>{t('ui.reconnect')}</Button>
                            </div>
                        ) : (
                            <Button outline className="mt-4" onClick={() => setShowElevenLabsModal(true)}>{t('ui.connect_elevenlabs')}</Button>
                        )}
                    </PageSection>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? t('ui.saving') : t('ui.save_settings')}
                        </Button>
                    </div>
                </form>
            </div>

            <ElevenLabsConnectModal
                open={showElevenLabsModal}
                onClose={() => setShowElevenLabsModal(false)}
                onConnected={() => router.reload()}
                reconnect={!!tenant.elevenlabs_connected_at}
            />
        </AuthenticatedLayout>
    );
}
