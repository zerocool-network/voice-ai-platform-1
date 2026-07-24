import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Switch } from '@/Components/catalyst/switch';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Mic, Upload, Play, Trash2, Star, Search, Plus, Pause, Library } from 'lucide-react';
import { store, destroy, setDefault } from '@/actions/App/Http/Controllers/Web/VoiceController';

const TABS = {
    myVoices: 'My Voices',
    library: 'Library',
};

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white truncate">{voice.name}</h3>
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
                    <Badge color="emerald">Added</Badge>
                ) : (
                    <Button outline onClick={handleAdd} disabled={isAdding} aria-label={`Add ${voice.name}`}>
                        <Plus className="size-4" />
                        {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Index({ voices }) {
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

    return (
        <AuthenticatedLayout>
            <Head title="Custom Voices" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Custom Voices</Heading>
                    <Text className="mt-1">Clone and manage custom voices from your own audio samples.</Text>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={openClone}>Clone Voice</Button>
                </div>
            </div>

            <div className="mt-4 mb-6 flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                {Object.entries(TABS).map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                            activeTab === key
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'myVoices' && (
                <>
                    {voices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                            <Mic className="size-10 text-zinc-400" />
                            <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No custom voices</p>
                            <Text className="mt-2">Clone your voice from audio samples to get started.</Text>
                            <Button onClick={openClone} className="mt-4">Clone Your First Voice</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Samples</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader className="text-right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {voices.map((voice) => (
                                    <TableRow key={voice.id}>
                                        <TableCell className="font-medium">
                                            <button
                                                type="button"
                                                onClick={() => setDetailVoice(voice)}
                                                className="text-left hover:text-indigo-600"
                                            >
                                                {voice.name} {voice.is_default && <Star className="inline size-3 text-indigo-500" />}
                                            </button>
                                        </TableCell>
                                        <TableCell>{voice.sample_count}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1.5">
                                                {voice.is_default && <Badge color="indigo">Default</Badge>}
                                                {voice.requires_verification && <Badge color="amber">Pending</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {voice.preview_url && (
                                                    <Button outline onClick={() => new Audio(voice.preview_url).play()} title="Preview" aria-label={`Preview ${voice.name}`}>
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </>
            )}

            {activeTab === 'library' && (
                <>
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                placeholder="Search voices by name..."
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
                                Retry
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
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                            <Library className="size-10 text-zinc-400" />
                            <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No voices found</p>
                            <Text className="mt-2">Try a different search term.</Text>
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
                                    <Button outline onClick={handleLoadMore}>Load More</Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <Dialog open={cloneOpen} onClose={() => setCloneOpen(false)} size="xl">
                <DialogTitle>Clone Voice</DialogTitle>
                <DialogDescription>
                    Upload up to 3 audio samples to clone a voice. Short, clean samples with no background noise work best.
                </DialogDescription>
                <form onSubmit={handleClone}>
                    <DialogBody className="space-y-5">
                        <Field>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required placeholder="My Custom Voice" invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Audio Samples ({data.files.length}/3)</Label>
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
                                <Text className="mt-2 text-center">Drop audio files here or click to browse</Text>
                                <Text className="text-xs text-zinc-400">MP3, WAV, FLAC, M4A — up to 25MB each</Text>
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
                            <Label>Description</Label>
                            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} placeholder="Optional description for this voice..." invalid={errors.description ? true : undefined} />
                            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Remove Background Noise</Label>
                                    <Text className="text-xs">Clean up audio samples before cloning</Text>
                                </div>
                                <Switch checked={data.remove_background_noise} onChange={(v) => setData('remove_background_noise', v)} />
                            </div>
                        </Field>
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setCloneOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing || data.files.length === 0}>
                            {processing ? 'Cloning...' : 'Clone Voice'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={detailVoice !== null} onClose={() => setDetailVoice(null)} size="lg">
                {detailVoice && (
                    <>
                        <DialogTitle>{detailVoice.name}</DialogTitle>
                        <DialogDescription>Voice details and metadata</DialogDescription>
                        <DialogBody className="space-y-4">
                            {detailVoice.requires_verification && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20">
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Verification pending — this voice requires ElevenLabs verification before use.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text className="text-xs text-zinc-500">ElevenLabs ID</Text>
                                    <p className="font-mono text-sm">{detailVoice.elevenlabs_voice_id}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Samples</Text>
                                    <p className="text-sm">{detailVoice.sample_count}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Status</Text>
                                    <div className="flex gap-1.5 mt-0.5">
                                        {detailVoice.is_default && <Badge color="indigo">Default</Badge>}
                                        {detailVoice.requires_verification ? <Badge color="amber">Pending Verification</Badge> : <Badge color="emerald">Ready</Badge>}
                                    </div>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Labels</Text>
                                    <p className="text-sm">{detailVoice.labels ? JSON.stringify(detailVoice.labels) : 'None'}</p>
                                </div>
                            </div>
                            {detailVoice.description && (
                                <div>
                                    <Text className="text-xs text-zinc-500">Description</Text>
                                    <p className="text-sm">{detailVoice.description}</p>
                                </div>
                            )}
                            {detailVoice.preview_url && (
                                <div>
                                    <Text className="text-xs text-zinc-500">Preview</Text>
                                    <audio controls className="mt-1 w-full">
                                        <source src={detailVoice.preview_url} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}
                        </DialogBody>
                        <DialogActions>
                            <Button plain onClick={() => setDetailVoice(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog open={deleteVoice !== null} onClose={() => setDeleteVoice(null)}>
                <DialogTitle>Delete Voice</DialogTitle>
                <DialogDescription>
                    Delete &ldquo;{deleteVoice?.name}&rdquo;? This will remove the voice from ElevenLabs and all flows using it.
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteVoice(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Voice'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
