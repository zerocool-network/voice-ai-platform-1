import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Switch } from '@/Components/catalyst/switch';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Mic, Upload, Play, Trash2, Star, Search, Plus, Pause, Library } from 'lucide-react';
import { store, destroy, setDefault } from '@/actions/App/Http/Controllers/Web/VoiceController';

const TAB_KEYS = ['myVoices', 'library'];

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mb-2 h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex items-center justify-between mt-4">
                <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
        </div>
    );
}

function VoiceCard({ voice, onPlayPause, playingVoiceId, onAdd, addingVoiceId, localVoiceIds }) {
    const { t } = useTranslation();
    const isLocal = localVoiceIds.has(voice.voice_id);
    const isPlaying = playingVoiceId === voice.voice_id;
    const isAdding = addingVoiceId === voice.voice_id;

    function handlePlayPause(e) {
        e.stopPropagation();
        onPlayPause(voice.voice_id, voice.preview_url);
    }

    function handleAdd(e) {
        e.stopPropagation();
        onAdd(voice);
    }

    return (
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
            <div>
                <h3 className="font-semibold text-slate-950 truncate">{voice.name}</h3>
                {voice.labels?.accent && (
                    <Badge color="zinc" className="mt-1">{voice.labels.accent}</Badge>
                )}
                {voice.category && voice.category !== 'generated' && (
                    <Badge color="zinc" className="mt-1 ml-1">{voice.category}</Badge>
                )}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                {voice.preview_url && (
                    <Button outline onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                )}
                {isLocal ? (
                    <Badge color="emerald">{t('ui.voices_added')}</Badge>
                ) : (
                    <Button outline onClick={handleAdd} disabled={isAdding} aria-label={`Add ${voice.name}`}>
                        <Plus className="size-4" />
                        {isAdding ? t('ui.voices_adding') : t('ui.voices_add')}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Index({ voices }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('myVoices');
    const [cloneOpen, setCloneOpen] = useState(false);
    const [deleteVoice, setDeleteVoice] = useState(null);
    const [detailVoice, setDetailVoice] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const [libraryVoices, setLibraryVoices] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [libraryError, setLibraryError] = useState(null);
    const [librarySearch, setLibrarySearch] = useState('');
    const [libraryCursor, setLibraryCursor] = useState(null);
    const [libraryHasMore, setLibraryHasMore] = useState(false);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [addingVoiceId, setAddingVoiceId] = useState(null);
    const audioRef = useRef(null);
    const searchTimeout = useRef(null);

    const localVoiceIds = new Set(voices.map((v) => v.elevenlabs_voice_id));

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        files: [],
        description: '',
        remove_background_noise: false,
    });

    const fetchLibrary = useCallback(async (search = '', cursor = null, append = false) => {
        setLibraryLoading(true);
        setLibraryError(null);

        try {
            const params = {};
            if (search) params.search = search;
            if (cursor) params.cursor = cursor;

            const { data: res } = await axios.get('/settings/voices/library', { params });

            if (append) {
                setLibraryVoices((prev) => [...prev, ...res.data]);
            } else {
                setLibraryVoices(res.data);
            }
            setLibraryCursor(res.next_cursor);
            setLibraryHasMore(res.has_more);
        } catch (e) {
            setLibraryVoices([]);
            setLibraryError(e.response?.data?.error || 'Failed to load voice library.');
        } finally {
            setLibraryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'library' && libraryVoices.length === 0 && !libraryError) {
            fetchLibrary();
        }
    }, [activeTab]);

    function handleSearch(value) {
        setLibrarySearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchLibrary(value);
        }, 300);
    }

    function handleLoadMore() {
        if (libraryCursor) {
            fetchLibrary(librarySearch, libraryCursor, true);
        }
    }

    function handlePlayPause(voiceId, previewUrl) {
        if (playingVoiceId === voiceId) {
            audioRef.current?.pause();
            setPlayingVoiceId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(previewUrl);
        audio.addEventListener('ended', () => setPlayingVoiceId(null));
        audio.addEventListener('pause', () => setPlayingVoiceId(null));
        audio.play().catch(() => {});
        audioRef.current = audio;
        setPlayingVoiceId(voiceId);
    }

    function handleAddFromLibrary(voice) {
        setAddingVoiceId(voice.voice_id);

        router.post('/settings/voices/library', {
            elevenlabs_voice_id: voice.voice_id,
            name: voice.name,
            preview_url: voice.preview_url || null,
            description: voice.description || null,
            labels: voice.labels || null,
        }, {
            onSuccess: () => {
                setAddingVoiceId(null);
                toast.success(`"${voice.name}" added to your voices.`);
            },
            onError: (err) => {
                setAddingVoiceId(null);
                toast.error(err?.error || 'Failed to add voice.');
            },
        });
    }

    function openClone() {
        reset();
        setCloneOpen(true);
    }

    function handleFiles(e) {
        const selected = Array.from(e.target.files);
        setData('files', [...data.files, ...selected].slice(0, 3));
    }

    function removeFile(index) {
        setData('files', data.files.filter((_, i) => i !== index));
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files).filter(
            (f) => f.type.startsWith('audio/')
        );
        if (dropped.length) {
            setData('files', [...data.files, ...dropped].slice(0, 3));
        }
    }

    function handleClone(e) {
        e.preventDefault();
        router.post(store().url, data, {
            forceFormData: true,
            onSuccess: () => { setCloneOpen(false); reset(); },
        });
    }

    function handleDelete() {
        if (!deleteVoice) return;
        router.delete(destroy({voice: deleteVoice.id}).url, {
            onSuccess: () => setDeleteVoice(null),
        });
    }

    function handleSetDefault(voice) {
        router.patch(setDefault({voice: voice.id}).url, { preserveScroll: true });
    }

    const voiceColumns = useMemo(() => [
        {
            id: 'name',
            header: t('ui.voices_table_name'),
            cell: (voice) => (
                <button
                    type="button"
                    onClick={() => setDetailVoice(voice)}
                    className="text-left font-medium hover:text-indigo-600"
                >
                    {voice.name} {voice.is_default && <Star className="inline size-3 text-indigo-500" />}
                </button>
            ),
        },
        {
            id: 'samples',
            header: t('ui.voices_table_samples'),
            cell: (voice) => voice.sample_count,
        },
        {
            id: 'status',
            header: t('ui.voices_table_status'),
            cell: (voice) => (
                <div className="flex gap-1.5">
                    {voice.is_default && <Badge color="indigo">{t('ui.voices_default')}</Badge>}
                    {voice.requires_verification && <Badge color="amber">{t('ui.voices_pending')}</Badge>}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (voice) => (
                <div className="flex justify-end gap-2">
                    {voice.preview_url && (
                        <Button outline onClick={() => new Audio(voice.preview_url).play()} title={t('ui.voices_preview')} aria-label={`${t('ui.voices_preview')} ${voice.name}`}>
                            <Play className="size-4" />
                        </Button>
                    )}
                    {!voice.is_default && (
                        <Button outline onClick={() => handleSetDefault(voice)} title="Set as default" aria-label={`Set ${voice.name} as default`}>
                            <Star className="size-4" />
                        </Button>
                    )}
                    <Button outline onClick={() => setDeleteVoice(voice)} aria-label={`Delete ${voice.name}`}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ], [t]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.custom_voices_title')} />

            <PageHeader
                title={t('ui.custom_voices_title')}
                subtitle={t('ui.voices_subtitle')}
                actions={
                    <Button onClick={openClone}>{t('ui.voices_clone')}</Button>
                }
            />

            <div className="mt-4 mb-6 flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                {TAB_KEYS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                            activeTab === key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {key === 'myVoices' ? t('ui.voices_tab_my_voices') : t('ui.voices_tab_library')}
                    </button>
                ))}
            </div>

            {activeTab === 'myVoices' && (
                <DataTable
                    className="mt-2"
                    columns={voiceColumns}
                    data={voices}
                    getRowId={(row) => row.id}
                    emptyIcon={Mic}
                    emptyTitle={t('ui.voices_no_custom_voices')}
                    emptyDescription={t('ui.voices_no_custom_voices_desc')}
                    emptyAction={{ label: t('ui.voices_clone_first'), onClick: openClone }}
                />
            )}

            {activeTab === 'library' && (
                <>
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                placeholder={t('ui.voices_search_placeholder')}
                                value={librarySearch}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <audio ref={audioRef} className="hidden" />

                    {libraryError && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 dark:border-red-800/50 dark:bg-red-900/20">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">{libraryError}</p>
                            <Button outline onClick={() => fetchLibrary(librarySearch)} className="mt-4">
                                {t('ui.voices_retry')}
                            </Button>
                        </div>
                    )}

                    {libraryLoading && libraryVoices.length === 0 && !libraryError && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(4)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    )}

                    {!libraryLoading && !libraryError && libraryVoices.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
                            <Library className="size-10 text-slate-400" />
                            <p className="mt-4 text-base font-semibold text-slate-950">{t('ui.voices_no_voices_found')}</p>
                            <Text className="mt-2">{t('ui.voices_try_different_search')}</Text>
                        </div>
                    )}

                    {libraryVoices.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {libraryVoices.map((voice) => (
                                    <VoiceCard
                                        key={voice.voice_id}
                                        voice={voice}
                                        onPlayPause={handlePlayPause}
                                        playingVoiceId={playingVoiceId}
                                        onAdd={handleAddFromLibrary}
                                        addingVoiceId={addingVoiceId}
                                        localVoiceIds={localVoiceIds}
                                    />
                                ))}
                            </div>

                            {libraryLoading && (
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[...Array(3)].map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            )}

                            {libraryHasMore && !libraryLoading && (
                                <div className="mt-6 flex justify-center">
                                    <Button outline onClick={handleLoadMore}>{t('ui.voices_load_more')}</Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <Dialog open={cloneOpen} onClose={() => setCloneOpen(false)} size="xl">
                <DialogTitle>{t('ui.voices_clone_title')}</DialogTitle>
                <DialogDescription>
                    {t('ui.voices_clone_desc')}
                </DialogDescription>
                <form onSubmit={handleClone}>
                    <DialogBody className="space-y-5">
                        <Field>
                            <Label>{t('ui.voices_name')}</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required placeholder={t('ui.voices_name_placeholder')} invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{t('ui.voices_audio_samples')} ({data.files.length}/3)</Label>
                            <div
                                className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                                    dragOver ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950' : 'border-zinc-950/15 dark:border-white/15'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-8 text-zinc-400" />
                                <Text className="mt-2 text-center">{t('ui.voices_drop_audio')}</Text>
                                <Text className="text-xs text-slate-400">{t('ui.voices_audio_formats')}</Text>
                                <input ref={fileInputRef} type="file" accept=".mp3,.wav,.flac,.m4a,audio/mpeg,audio/wav,audio/flac,audio/mp4" multiple className="hidden" onChange={handleFiles} />
                            </div>
                            {errors.files && <ErrorMessage>{errors.files}</ErrorMessage>}
                            {errors['files.0'] && <ErrorMessage>{errors['files.0']}</ErrorMessage>}
                            {data.files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {data.files.map((file, i) => (
                                        <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                                            <span className="truncate text-sm">{file.name}</span>
                                            <Button plain onClick={() => removeFile(i)}><Trash2 className="size-4 text-red-500" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Field>

                        <Field>
                            <Label>{t('ui.voices_description')}</Label>
                            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} placeholder={t('ui.voices_description_placeholder')} invalid={errors.description ? true : undefined} />
                            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>{t('ui.voices_remove_noise')}</Label>
                                    <Text className="text-xs">{t('ui.voices_remove_noise_desc')}</Text>
                                </div>
                                <Switch checked={data.remove_background_noise} onChange={(v) => setData('remove_background_noise', v)} />
                            </div>
                        </Field>
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setCloneOpen(false)}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={processing || data.files.length === 0}>
                            {processing ? t('ui.voices_cloning') : t('ui.voices_clone')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={detailVoice !== null} onClose={() => setDetailVoice(null)} size="lg">
                {detailVoice && (
                    <>
                        <DialogTitle>{detailVoice.name}</DialogTitle>
                        <DialogDescription>{t('ui.voices_voice_details')}</DialogDescription>
                        <DialogBody className="space-y-4">
                            {detailVoice.requires_verification && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-sm font-medium text-amber-700">{t('ui.voices_verification_pending')}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_elevenlabs_id')}</Text>
                                    <p className="font-mono text-sm">{detailVoice.elevenlabs_voice_id}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_samples')}</Text>
                                    <p className="text-sm">{detailVoice.sample_count}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_status')}</Text>
                                    <div className="flex gap-1.5 mt-0.5">
                                        {detailVoice.is_default && <Badge color="indigo">{t('ui.voices_default')}</Badge>}
                                        {detailVoice.requires_verification ? <Badge color="amber">{t('ui.voices_pending_verification')}</Badge> : <Badge color="emerald">{t('ui.voices_ready')}</Badge>}
                                    </div>
                                </div>
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_labels')}</Text>
                                    <p className="text-sm">{detailVoice.labels ? JSON.stringify(detailVoice.labels) : t('ui.voices_none')}</p>
                                </div>
                            </div>
                            {detailVoice.description && (
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_description')}</Text>
                                    <p className="text-sm">{detailVoice.description}</p>
                                </div>
                            )}
                            {detailVoice.preview_url && (
                                <div>
                                    <Text className="text-xs text-slate-500">{t('ui.voices_preview')}</Text>
                                    <audio controls className="mt-1 w-full">
                                        <source src={detailVoice.preview_url} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}
                        </DialogBody>
                        <DialogActions>
                            <Button plain onClick={() => setDetailVoice(null)}>{t('ui.voices_close')}</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog open={deleteVoice !== null} onClose={() => setDeleteVoice(null)}>
                <DialogTitle>{t('ui.voices_delete_title')}</DialogTitle>
                <DialogDescription>
                    {t('ui.voices_delete_desc', { name: deleteVoice?.name ?? '' })}
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteVoice(null)}>{t('common.cancel')}</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? t('ui.voices_deleting') : t('ui.voices_delete_voice')}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
