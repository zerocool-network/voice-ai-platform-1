import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import DataTable from '@/Components/DataTable'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Textarea } from '@/Components/catalyst/textarea'
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog'
import { send } from '@/actions/App/Http/Controllers/Web/SmsController'
import sms from '@/routes/sms'
import { useTranslation } from '@/hooks/useTranslation'
import {
    MessageCircle, MessageSquare, Plus, Reply, Megaphone,
    Search, Send, ArrowLeft, Check, CheckCheck, X,
} from 'lucide-react'

const directionColors = {
    inbound: 'blue',
    outbound: 'emerald',
}

const channelConfig = {
    sms: { icon: MessageSquare, color: 'blue', label: 'SMS' },
    whatsapp: { icon: MessageCircle, color: 'emerald', label: 'WhatsApp' },
}

const statusIcons = {
    sent: { icon: Check, color: 'text-zinc-400' },
    delivered: { icon: CheckCheck, color: 'text-blue-500' },
    read: { icon: CheckCheck, color: 'text-blue-500' },
    failed: { icon: X, color: 'text-red-500' },
}

function formatTime(dateStr, t, locale) {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / 86400000)

    if (days === 0) return d.toLocaleTimeString(locale || undefined, { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return t('ui.yesterday')
    if (days < 7) return d.toLocaleDateString(locale || undefined, { weekday: 'short' })
    return d.toLocaleDateString(locale || undefined, { month: 'short', day: 'numeric' })
}

export default function Index({ messages, conversations, filters, whatsapp_phone_number }) {
    const { t, locale } = useTranslation()
    const [showSend, setShowSend] = useState(false)
    const [view, setView] = useState('conversations')
    const [selectedContact, setSelectedContact] = useState(null)
    const [convMessages, setConvMessages] = useState({})
    const [replyText, setReplyText] = useState('')
    const [sendingReply, setSendingReply] = useState(false)
    const [convSearch, setConvSearch] = useState('')
    const threadEndRef = useRef(null)
    const replyInputRef = useRef(null)

    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
        body: '',
        channel: 'sms',
    })

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [convMessages, selectedContact])

    useEffect(() => {
        if (selectedContact) replyInputRef.current?.focus()
    }, [selectedContact])

    function handleSend(e) {
        e.preventDefault()
        post(send().url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSend(false)
                reset()
                router.reload({ only: ['messages', 'conversations'] })
            },
        })
    }

    function openSend(channel = 'sms') {
        setData('channel', channel)
        setShowSend(true)
    }

    async function selectConversation(contact) {
        setSelectedContact(contact)
        if (!convMessages[contact]) {
            try {
                const res = await fetch(sms.conversation({ contactNumber: contact }).url)
                const data = await res.json()
                setConvMessages((prev) => ({ ...prev, [contact]: data }))
            } catch {
                // silent
            }
        }
    }

    async function sendReply() {
        if (!replyText.trim() || !selectedContact) return
        setSendingReply(true)
        try {
            await fetch(send().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content,
                },
                body: JSON.stringify({ to: selectedContact, body: replyText, channel: 'sms' }),
            })
            setReplyText('')
            const res = await fetch(sms.conversation({ contactNumber: selectedContact }).url)
            const data = await res.json()
            setConvMessages((prev) => ({ ...prev, [selectedContact]: data }))
        } catch {
            // silent
        } finally {
            setSendingReply(false)
        }
    }

    function handleReplyKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendReply()
        }
    }

    const filteredConversations = conversations.filter((conv) =>
        conv.contact_number.toLowerCase().includes(convSearch.toLowerCase()),
    )
    const selectedConv = conversations.find((c) => c.contact_number === selectedContact)
    const threadMessages = (convMessages[selectedContact] ?? []).slice().reverse()

    const messagesList = view === 'conversations' ? conversations : messages.data

    const messageColumns = useMemo(() => [
        {
            id: 'channel',
            header: t('ui.channel'),
            cell: (msg) => {
                const ch = channelConfig[msg.channel] || channelConfig.sms
                const ChIcon = ch.icon
                return (
                    <Badge color={ch.color}>
                        <ChIcon className="mr-1 size-3" />
                        {ch.label}
                    </Badge>
                )
            },
        },
        {
            id: 'from',
            header: t('calls.from'),
            cell: (msg) => <span className="font-medium">{msg.from_number}</span>,
        },
        { id: 'to', header: t('calls.to'), cell: (msg) => msg.to_number },
        {
            id: 'body',
            header: t('ui.message'),
            className: 'max-w-xs truncate',
            cell: (msg) => msg.body,
        },
        {
            id: 'direction',
            header: t('ui.direction'),
            cell: (msg) => (
                <Badge color={directionColors[msg.direction] || 'zinc'}>
                    {msg.direction === 'inbound' ? t('ui.inbound') : msg.direction === 'outbound' ? t('ui.outbound') : msg.direction}
                </Badge>
            ),
        },
        {
            id: 'status',
            header: t('common.status'),
            cell: (msg) => (
                <span className={`text-sm font-medium capitalize ${
                    statusIcons[msg.status]?.color || 'text-zinc-500'
                }`}>
                    {msg.status}
                </span>
            ),
        },
        {
            id: 'date',
            header: t('ui.date'),
            cell: (msg) => new Date(msg.created_at).toLocaleDateString(locale || undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            }),
        },
    ], [t, locale])

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.messages')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.messages')}
                    subtitle={t('ui.incoming_outgoing_sms')}
                    actions={(
                        <>
                            {whatsapp_phone_number && (
                                <Badge color="emerald">
                                    <MessageCircle className="mr-1 size-3" />
                                    {t('ui.whatsapp_label', { number: whatsapp_phone_number })}
                                </Badge>
                            )}
                            <Link href={sms.autoReplies.index().url}>
                                <Button outline>
                                    <Reply className="size-4" />
                                    {t('ui.auto_replies')}
                                </Button>
                            </Link>
                            <Link href={sms.campaigns.index().url}>
                                <Button outline>
                                    <Megaphone className="size-4" />
                                    {t('ui.campaigns')}
                                </Button>
                            </Link>
                            {whatsapp_phone_number && (
                                <Button outline onClick={() => openSend('whatsapp')}>
                                    <MessageCircle className="size-4" />
                                    {t('ui.new_whatsapp')}
                                </Button>
                            )}
                            <Button onClick={() => openSend('sms')}>
                                <Plus className="size-4" />
                                {t('ui.new_message')}
                            </Button>
                        </>
                    )}
                />

            <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-200/70 bg-white p-0.5">
                    <button
                        onClick={() => { setView('conversations'); setSelectedContact(null) }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            view === 'conversations'
                                ? 'bg-slate-950 text-white'
                                : 'text-slate-500 hover:text-slate-950'
                        }`}
                    >
                        {t('ui.conversations')}
                    </button>
                    <button
                        onClick={() => { setView('all'); setSelectedContact(null) }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            view === 'all'
                                ? 'bg-slate-950 text-white'
                                : 'text-slate-500 hover:text-slate-950'
                        }`}
                    >
                        {t('ui.all_messages')}
                    </button>
                </div>
            </div>

            {view === 'conversations' ? (
                <PageSection padding={false} className="flex h-[calc(100vh-320px)] min-h-[500px] overflow-hidden">
                    {/* Left: Conversation List */}
                    <div className={`flex w-[380px] shrink-0 flex-col border-r border-zinc-200 ${
                        selectedContact ? 'hidden md:flex' : 'flex'
                    }`}>
                        <div className="border-b border-zinc-200 p-3">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={convSearch}
                                    onChange={(e) => setConvSearch(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={t('ui.search_conversations')}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-500">
                                    <MessageSquare className="mb-2 size-8 text-zinc-300" />
                                    <p>{t('ui.no_conversations_found')}</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const ch = channelConfig[conv.last_channel] || channelConfig.sms
                                    const ChIcon = ch.icon
                                    const isSelected = selectedContact === conv.contact_number
                                    return (
                                        <button
                                            key={conv.contact_number}
                                            onClick={() => selectConversation(conv.contact_number)}
                                            className={`flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${
                                                isSelected ? 'bg-indigo-50' : ''
                                            }`}
                                        >
                                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                                ch.color === 'blue'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                <ChIcon className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate text-sm font-medium text-zinc-900">
                                                        {conv.contact_number}
                                                    </span>
                                                    <span className="shrink-0 text-[11px] text-zinc-400">
                                                        {formatTime(conv.last_message_at, t, locale)}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                                    <span className="truncate text-xs text-zinc-500">
                                                        {conv.last_body
                                                            ? (conv.last_body.length > 60
                                                                ? conv.last_body.slice(0, 60) + '...'
                                                                : conv.last_body)
                                                            : t('ui.messages_count', { count: conv.message_count })}
                                                    </span>
                                                    {conv.message_count > 1 && (
                                                        <span className="shrink-0 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                                                            {conv.message_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Thread View */}
                    {selectedContact ? (
                        <div className="flex flex-1 flex-col">
                            {/* Thread Header */}
                            <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-3">
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 md:hidden"
                                >
                                    <ArrowLeft className="size-5" />
                                </button>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-zinc-900">
                                        {selectedContact}
                                    </p>
                                    {selectedConv && (
                                        <p className="text-xs text-zinc-500">
                                            {t('ui.messages_count', { count: selectedConv.message_count })}
                                        </p>
                                    )}
                                </div>
                                <Badge color="blue">{t('ui.sms')}</Badge>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {threadMessages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                                        {t('ui.no_messages_in_conversation')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {threadMessages.map((msg) => {
                                            const StatusIcon = statusIcons[msg.status]?.icon
                                            const statusColor = statusIcons[msg.status]?.color
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${
                                                        msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                                                        msg.direction === 'outbound'
                                                            ? 'rounded-br-md bg-indigo-500 text-white'
                                                            : 'rounded-bl-md bg-zinc-100 text-zinc-700'
                                                    }`}>
                                                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                                                        <div className={`mt-1 flex items-center justify-end gap-1.5 ${
                                                            msg.direction === 'outbound' ? 'text-white/70' : 'text-zinc-400'
                                                        }`}>
                                                            <span className="text-[10px]">
                                                                {new Date(msg.created_at).toLocaleTimeString(locale || undefined, {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                            {msg.direction === 'outbound' && StatusIcon && (
                                                                <StatusIcon className={`size-3 ${statusColor}`} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={threadEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Reply Input */}
                            <div className="border-t border-zinc-200 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={replyInputRef}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={handleReplyKeyDown}
                                        className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder={t('ui.type_reply_placeholder')}
                                    />
                                    <Button
                                        onClick={sendReply}
                                        disabled={sendingReply || !replyText.trim()}
                                    >
                                        {sendingReply ? (
                                            <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        ) : (
                                            <Send className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty state - no conversation selected */
                        <div className="hidden flex-1 items-center justify-center md:flex">
                            <div className="text-center">
                                <MessageSquare className="mx-auto size-12 text-zinc-200" />
                                <p className="mt-4 text-sm font-medium text-zinc-500">
                                    {t('ui.select_conversation')}
                                </p>
                                <Text className="mt-1">
                                    {t('ui.choose_conversation_from_list')}
                                </Text>
                            </div>
                        </div>
                    )}
                </PageSection>
            ) : (
                <DataTable
                    columns={messageColumns}
                    data={messagesList}
                    getRowId={(row) => row.id}
                    emptyIcon={MessageSquare}
                    emptyTitle={t('ui.no_messages')}
                    emptyDescription={t('ui.messages_appear')}
                    toolbar={(
                        <>
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder={t('ui.search_number_or_message')}
                                    value={filters.search ?? ''}
                                    onChange={(e) => router.get('/sms', { search: e.target.value }, { preserveState: true })}
                                />
                            </div>
                            <div className="w-36">
                                <Select
                                    value={filters.direction ?? ''}
                                    onChange={(e) => router.get('/sms', { direction: e.target.value }, { preserveState: true })}
                                >
                                    <option value="">{t('ui.all')}</option>
                                    <option value="inbound">{t('ui.inbound')}</option>
                                    <option value="outbound">{t('ui.outbound')}</option>
                                </Select>
                            </div>
                        </>
                    )}
                    footer={messages.links ? (
                        <div className="flex items-center gap-1">
                            {messages.links.map((link) => {
                                if (link.url === null) return null
                                const label = link.label.replace(/&laquo;|&raquo;|‹|›/g, '').trim()
                                return (
                                    <Link
                                        key={link.url}
                                        href={link.url}
                                        className={`rounded-md px-3 py-1 text-sm ${
                                            link.active
                                                ? 'bg-zinc-950 text-white'
                                                : 'text-zinc-500 hover:text-zinc-950'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                )
                            })}
                        </div>
                    ) : null}
                />
            )}

            <Dialog open={showSend} onClose={() => setShowSend(false)} size="md">
                <DialogTitle>{t('ui.send_message')}</DialogTitle>
                <DialogBody>
                    <form id="send-form" onSubmit={handleSend} className="space-y-4">
                        <Field>
                            <Label>{t('ui.channel')}</Label>
                            <Select
                                value={data.channel}
                                onChange={(e) => setData('channel', e.target.value)}
                                invalid={errors.channel ? true : undefined}
                            >
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                            </Select>
                            {errors.channel && <ErrorMessage>{errors.channel}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.phone_number')}</Label>
                            <Input
                                value={data.to}
                                onChange={(e) => setData('to', e.target.value)}
                                placeholder="+12345678900"
                                invalid={errors.to ? true : undefined}
                            />
                            {errors.to && <ErrorMessage>{errors.to}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.message')}</Label>
                            <Textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder={t('ui.type_message')}
                                rows={4}
                                invalid={errors.body ? true : undefined}
                            />
                            <Text className="mt-1 text-right text-xs text-zinc-500">
                                {data.body.length}/1600
                            </Text>
                            {errors.body && <ErrorMessage>{errors.body}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setShowSend(false)}>{t('ui.cancel')}</Button>
                    <Button type="submit" form="send-form" disabled={processing}>
                        {processing ? t('ui.sending') : t('ui.send')}
                    </Button>
                </DialogActions>
            </Dialog>
            </div>
        </AuthenticatedLayout>
    )
}
