import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Select } from '@/Components/catalyst/select';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, Legend, FieldGroup, ErrorMessage } from '@/Components/catalyst/fieldset';
import { index, store, update, destroy, syncFromApi } from '@/actions/App/Http/Controllers/Web/ElevenLabsAgentController';
import { motion } from 'motion/react';
import { Text } from '@/Components/catalyst/text';
import { Bot } from 'lucide-react';

const LANGUAGES = [
    { value: '', label: 'Default' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'nl', label: 'Dutch' },
    { value: 'pl', label: 'Polish' },
    { value: 'ru', label: 'Russian' },
    { value: 'tr', label: 'Turkish' },
    { value: 'hi', label: 'Hindi' },
];

const TTS_MODELS = [
    { value: '', label: 'Default' },
    { value: 'eleven_turbo_v2_5', label: 'Eleven Turbo v2.5' },
    { value: 'eleven_multilingual_v2', label: 'Eleven Multilingual v2' },
    { value: 'eleven_flash_v2_5', label: 'Eleven Flash v2.5' },
    { value: 'eleven_flash_v2', label: 'Eleven Flash v2' },
];

const STT_PROVIDERS = [
    { value: '', label: 'Default' },
    { value: 'elevenlabs', label: 'ElevenLabs' },
    { value: 'deepgram', label: 'Deepgram' },
    { value: 'twilio', label: 'Twilio' },
];

const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.25 },
    }),
};

function SectionHeader({ children }) {
    return (
        <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {children}
            </h3>
        </div>
    );
}

function initialFormData() {
    return {
        name: '',
        system_prompt: '',
        first_message: '',
        language: '',
        llm_model: '',
        llm_temperature: 0.7,
        llm_max_tokens: 500,
        tts_voice_id: '',
        tts_model: '',
        turn_sensitivity: 0.5,
        stt_provider: '',
    };
}

export default function Index({ agents }) {
    const { t } = useTranslation();
    const [createOpen, setCreateOpen] = useState(false);
    const [editAgent, setEditAgent] = useState(null);
    const [deleteAgent, setDeleteAgent] = useState(null);

    const { data, setData, processing, errors, reset } = useForm(initialFormData());

    function openCreate() {
        reset();
        setCreateOpen(true);
    }

    function openEdit(agent) {
        setData({
            name: agent.name,
            system_prompt: agent.config?.system_prompt ?? '',
            first_message: agent.config?.first_message ?? '',
            language: agent.config?.language ?? '',
            llm_model: agent.config?.llm_model ?? '',
            llm_temperature: agent.config?.llm_temperature ?? 0.7,
            llm_max_tokens: agent.config?.llm_max_tokens ?? 500,
            tts_voice_id: agent.config?.tts_voice_id ?? '',
            tts_model: agent.config?.tts_model ?? '',
            turn_sensitivity: agent.config?.turn_sensitivity ?? 0.5,
            stt_provider: agent.config?.stt_provider ?? '',
        });
        setEditAgent(agent);
    }

    function handleCreate(e) {
        e.preventDefault();
        router.post(store().url, data, {
            onSuccess: () => { setCreateOpen(false); reset(); },
        });
    }

    function handleUpdate(e) {
        e.preventDefault();
        router.patch(update({ agent: editAgent.id }).url, data, {
            onSuccess: () => { setEditAgent(null); reset(); },
        });
    }

    function handleDelete() {
        if (!deleteAgent) return;
        router.delete(destroy({ agent: deleteAgent.id }).url, {
            onSuccess: () => setDeleteAgent(null),
        });
    }

    function handleSync() {
        if (confirm(t('ui.agents_sync_confirm'))) {
            router.post(syncFromApi().url);
        }
    }

    const columns = useMemo(() => [
        {
            id: 'name',
            header: t('ui.agents_table_name'),
            cell: (agent) => <span className="font-medium">{agent.name}</span>,
        },
        {
            id: 'elevenlabs_id',
            header: t('ui.agents_table_elevenlabs_id'),
            meta: { mono: true },
            cell: (agent) => <span className="text-xs text-slate-500">{agent.elevenlabs_agent_id}</span>,
        },
        {
            id: 'status',
            header: t('ui.agents_table_status'),
            cell: (agent) => (
                <Badge color={agent.is_active ? 'emerald' : 'zinc'}>
                    {agent.is_active ? t('ui.agents_active') : t('ui.agents_inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (agent) => (
                <div className="flex justify-end gap-2">
                    <Button outline onClick={() => openEdit(agent)}>{t('ui.agents_edit')}</Button>
                    <Button outline onClick={() => setDeleteAgent(agent)}>{t('ui.agents_delete')}</Button>
                </div>
            ),
        },
    ], [t]);

    function formFields(i = 0) {
        return (
            <DialogBody className="space-y-8">
                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>{t('ui.agents_basic_settings')}</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>{t('ui.agents_name')}</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_system_prompt')}</Label>
                            <Textarea value={data.system_prompt} onChange={(e) => setData('system_prompt', e.target.value)} rows={4} placeholder="You are a helpful assistant..." invalid={errors.system_prompt ? true : undefined} />
                            {errors.system_prompt && <ErrorMessage>{errors.system_prompt}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_first_message')}</Label>
                            <Input value={data.first_message} onChange={(e) => setData('first_message', e.target.value)} placeholder="Hello! How can I help you?" invalid={errors.first_message ? true : undefined} />
                            {errors.first_message && <ErrorMessage>{errors.first_message}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_language')}</Label>
                            <Select value={data.language} onChange={(e) => setData('language', e.target.value)} invalid={errors.language ? true : undefined}>
                                {LANGUAGES.map((l) => (
                                    <option key={l.value} value={l.value}>{l.label}</option>
                                ))}
                            </Select>
                            {errors.language && <ErrorMessage>{errors.language}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>

                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>{t('ui.agents_llm_config')}</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>{t('ui.agents_model_id')}</Label>
                            <Input value={data.llm_model} onChange={(e) => setData('llm_model', e.target.value)} placeholder="eleven_turbo_v2, gpt-4o" invalid={errors.llm_model ? true : undefined} />
                            {errors.llm_model && <ErrorMessage>{errors.llm_model}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_temperature')} ({data.llm_temperature})</Label>
                            <Input type="range" min="0" max="2" step="0.1" value={data.llm_temperature} onChange={(e) => setData('llm_temperature', parseFloat(e.target.value))} />
                            {errors.llm_temperature && <ErrorMessage>{errors.llm_temperature}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_max_tokens')}</Label>
                            <Input type="number" min="100" max="4096" value={data.llm_max_tokens} onChange={(e) => setData('llm_max_tokens', parseInt(e.target.value) || 500)} invalid={errors.llm_max_tokens ? true : undefined} />
                            {errors.llm_max_tokens && <ErrorMessage>{errors.llm_max_tokens}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>

                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>{t('ui.agents_voice_config')}</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>{t('ui.agents_voice_id')}</Label>
                            <Input value={data.tts_voice_id} onChange={(e) => setData('tts_voice_id', e.target.value)} placeholder="ElevenLabs voice ID" invalid={errors.tts_voice_id ? true : undefined} />
                            {errors.tts_voice_id && <ErrorMessage>{errors.tts_voice_id}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_tts_model')}</Label>
                            <Select value={data.tts_model} onChange={(e) => setData('tts_model', e.target.value)} invalid={errors.tts_model ? true : undefined}>
                                {TTS_MODELS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                            {errors.tts_model && <ErrorMessage>{errors.tts_model}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.agents_turn_sensitivity')} ({data.turn_sensitivity})</Label>
                            <Input type="range" min="0" max="1" step="0.05" value={data.turn_sensitivity} onChange={(e) => setData('turn_sensitivity', parseFloat(e.target.value))} />
                            {errors.turn_sensitivity && <ErrorMessage>{errors.turn_sensitivity}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>

                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>{t('ui.agents_speech_recognition')}</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>{t('ui.agents_stt_provider')}</Label>
                            <Select value={data.stt_provider} onChange={(e) => setData('stt_provider', e.target.value)} invalid={errors.stt_provider ? true : undefined}>
                                {STT_PROVIDERS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </Select>
                            {errors.stt_provider && <ErrorMessage>{errors.stt_provider}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>
            </DialogBody>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.agents_title')} />

            <PageHeader
                title={t('ui.agents_title')}
                subtitle={t('ui.agents_subtitle')}
                actions={
                    <>
                        <Button outline onClick={handleSync}>{t('ui.agents_sync')}</Button>
                        <Button onClick={openCreate}>{t('ui.agents_create')}</Button>
                    </>
                }
            />

            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={agents}
                    getRowId={(row) => row.id}
                    emptyIcon={Bot}
                    emptyTitle={t('ui.agents_no_agents')}
                    emptyDescription={t('ui.agents_no_agents_desc')}
                    emptyAction={{ label: t('ui.agents_sync'), onClick: handleSync }}
                />
            </div>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} size="2xl">
                <DialogTitle>{t('ui.agents_create_title')}</DialogTitle>
                <DialogDescription>
                    {t('ui.agents_create_desc')}
                </DialogDescription>
                <form onSubmit={handleCreate}>
                    {formFields()}
                    <DialogActions>
                        <Button plain onClick={() => setCreateOpen(false)}>{t('ui.agents_cancel')}</Button>
                        <Button type="submit" disabled={processing}>{processing ? t('ui.agents_creating') : t('ui.agents_create')}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={editAgent !== null} onClose={() => setEditAgent(null)} size="2xl">
                <DialogTitle>{t('ui.agents_edit_title')}</DialogTitle>
                <DialogDescription>{t('ui.agents_edit_desc')}</DialogDescription>
                <form onSubmit={handleUpdate}>
                    {formFields()}
                    <DialogActions>
                        <Button plain onClick={() => setEditAgent(null)}>{t('ui.agents_cancel')}</Button>
                        <Button type="submit" disabled={processing}>{processing ? t('ui.agents_saving') : t('ui.agents_save_changes')}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteAgent !== null} onClose={() => setDeleteAgent(null)}>
                <DialogTitle>{t('ui.agents_delete_title')}</DialogTitle>
                <DialogDescription>
                    {t('ui.agents_delete_desc', { name: deleteAgent?.name ?? '' })}
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteAgent(null)}>{t('ui.agents_cancel')}</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? t('ui.agents_deleting') : t('ui.agents_delete_agent')}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
