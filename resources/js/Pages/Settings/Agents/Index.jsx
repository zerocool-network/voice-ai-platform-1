import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Select } from '@/Components/catalyst/select';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, Legend, FieldGroup, ErrorMessage } from '@/Components/catalyst/fieldset';
import { index, store, update, destroy, syncFromApi } from '@/actions/App/Http/Controllers/Web/ElevenLabsAgentController';

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
        <div className="border-b border-zinc-200 pb-2 dark:border-zinc-700">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
        if (confirm('Sync agents from ElevenLabs? This will import agents created in the ElevenLabs dashboard.')) {
            router.post(syncFromApi().url);
        }
    }

    function formFields(i = 0) {
        return (
            <DialogBody className="space-y-8">
                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>Basic Settings</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>System Prompt</Label>
                            <Textarea value={data.system_prompt} onChange={(e) => setData('system_prompt', e.target.value)} rows={4} placeholder="You are a helpful assistant..." invalid={errors.system_prompt ? true : undefined} />
                            {errors.system_prompt && <ErrorMessage>{errors.system_prompt}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>First Message</Label>
                            <Input value={data.first_message} onChange={(e) => setData('first_message', e.target.value)} placeholder="Hello! How can I help you?" invalid={errors.first_message ? true : undefined} />
                            {errors.first_message && <ErrorMessage>{errors.first_message}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Language</Label>
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
                    <SectionHeader>LLM Configuration</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>Model ID</Label>
                            <Input value={data.llm_model} onChange={(e) => setData('llm_model', e.target.value)} placeholder="eleven_turbo_v2, gpt-4o" invalid={errors.llm_model ? true : undefined} />
                            {errors.llm_model && <ErrorMessage>{errors.llm_model}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Temperature ({data.llm_temperature})</Label>
                            <Input type="range" min="0" max="2" step="0.1" value={data.llm_temperature} onChange={(e) => setData('llm_temperature', parseFloat(e.target.value))} />
                            {errors.llm_temperature && <ErrorMessage>{errors.llm_temperature}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Max Tokens</Label>
                            <Input type="number" min="100" max="4096" value={data.llm_max_tokens} onChange={(e) => setData('llm_max_tokens', parseInt(e.target.value) || 500)} invalid={errors.llm_max_tokens ? true : undefined} />
                            {errors.llm_max_tokens && <ErrorMessage>{errors.llm_max_tokens}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>

                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>Voice Configuration</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>Voice ID</Label>
                            <Input value={data.tts_voice_id} onChange={(e) => setData('tts_voice_id', e.target.value)} placeholder="ElevenLabs voice ID" invalid={errors.tts_voice_id ? true : undefined} />
                            {errors.tts_voice_id && <ErrorMessage>{errors.tts_voice_id}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>TTS Model</Label>
                            <Select value={data.tts_model} onChange={(e) => setData('tts_model', e.target.value)} invalid={errors.tts_model ? true : undefined}>
                                {TTS_MODELS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                            {errors.tts_model && <ErrorMessage>{errors.tts_model}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Turn Sensitivity ({data.turn_sensitivity})</Label>
                            <Input type="range" min="0" max="1" step="0.05" value={data.turn_sensitivity} onChange={(e) => setData('turn_sensitivity', parseFloat(e.target.value))} />
                            {errors.turn_sensitivity && <ErrorMessage>{errors.turn_sensitivity}</ErrorMessage>}
                        </Field>
                    </div>
                </motion.div>

                <motion.div custom={i++} variants={sectionVariants} initial="hidden" animate="visible">
                    <SectionHeader>Speech Recognition</SectionHeader>
                    <div className="mt-4 space-y-4">
                        <Field>
                            <Label>STT Provider</Label>
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
            <Head title="AI Agents" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>AI Agents</Heading>
                    <Text className="mt-1">Manage your ElevenLabs conversational AI agents.</Text>
                </div>
                <div className="flex gap-2">
                    <Button outline onClick={handleSync}>Sync from ElevenLabs</Button>
                    <Button onClick={openCreate}>Create Agent</Button>
                </div>
            </div>

            {agents.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No agents</p>
                    <Text className="mt-2">Create an AI agent or sync from ElevenLabs to get started.</Text>
                    <Button onClick={handleSync} className="mt-4">Sync from ElevenLabs</Button>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>ElevenLabs ID</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {agents.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell className="font-medium">{agent.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-500">{agent.elevenlabs_agent_id}</TableCell>
                                    <TableCell>
                                        <Badge color={agent.is_active ? 'emerald' : 'zinc'}>
                                            {agent.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button outline onClick={() => openEdit(agent)}>Edit</Button>
                                            <Button outline onClick={() => setDeleteAgent(agent)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} size="2xl">
                <DialogTitle>Create AI Agent</DialogTitle>
                <DialogDescription>
                    This will create a new conversational AI agent in your ElevenLabs account.
                </DialogDescription>
                <form onSubmit={handleCreate}>
                    {formFields()}
                    <DialogActions>
                        <Button plain onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create Agent'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={editAgent !== null} onClose={() => setEditAgent(null)} size="2xl">
                <DialogTitle>Edit Agent</DialogTitle>
                <DialogDescription>Update the agent configuration.</DialogDescription>
                <form onSubmit={handleUpdate}>
                    {formFields()}
                    <DialogActions>
                        <Button plain onClick={() => setEditAgent(null)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteAgent !== null} onClose={() => setDeleteAgent(null)}>
                <DialogTitle>Delete Agent</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete "{deleteAgent?.name}"? This will also remove it from ElevenLabs.
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteAgent(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Agent'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
