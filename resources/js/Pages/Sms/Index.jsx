import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Textarea } from '@/Components/catalyst/textarea'
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table'
import { send } from '@/actions/App/Http/Controllers/Web/SmsController'
import sms from '@/routes/sms'
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

function formatTime(dateStr) {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / 86400000)

    if (days === 0) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Index({ messages, conversations, filters, whatsapp_phone_number }) {
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

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Messages</Heading>
                    <Text className="mt-1">Incoming and outgoing SMS and WhatsApp messages.</Text>
                    {whatsapp_phone_number && (
                        <div className="mt-2 flex items-center gap-2">
                            <Badge color="emerald">
                                <MessageCircle className="mr-1 size-3" />
                                WhatsApp: {whatsapp_phone_number}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link href={sms.autoReplies.index().url}>
                        <Button outline>
                            <Reply className="size-4" />
                            Auto-Replies
                        </Button>
                    </Link>
                    <Link href={sms.campaigns.index().url}>
                        <Button outline>
                            <Megaphone className="size-4" />
                            Campaigns
                        </Button>
                    </Link>
                    {whatsapp_phone_number && (
                        <Button outline onClick={() => openSend('whatsapp')}>
                            <MessageCircle className="size-4" />
                            New WhatsApp
                        </Button>
                    )}
                    <Button onClick={() => openSend('sms')}>
                        <Plus className="size-4" />
                        New Message
                    </Button>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
                    <button
                        onClick={() => { setView('conversations'); setSelectedContact(null) }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            view === 'conversations'
                                ? 'bg-zinc-950 text-white'
                                : 'text-zinc-500 hover:text-zinc-950'
                        }`}
                    >
                        Conversations
                    </button>
                    <button
                        onClick={() => { setView('all'); setSelectedContact(null) }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            view === 'all'
                                ? 'bg-zinc-950 text-white'
                                : 'text-zinc-500 hover:text-zinc-950'
                        }`}
                    >
                        All Messages
                    </button>
                </div>
            </div>

            {view === 'conversations' ? (
                <div className="mt-4 flex h-[calc(100vh-320px)] min-h-[500px] overflow-hidden rounded-xl border border-zinc-200 bg-white">
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
                                    placeholder="Search conversations..."
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-500">
                                    <MessageSquare className="mb-2 size-8 text-zinc-300" />
                                    <p>No conversations found</p>
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
                                                        {formatTime(conv.last_message_at)}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                                    <span className="truncate text-xs text-zinc-500">
                                                        {conv.last_body
                                                            ? (conv.last_body.length > 60
                                                                ? conv.last_body.slice(0, 60) + '...'
                                                                : conv.last_body)
                                                            : `${conv.message_count} messages`}
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
                                            {selectedConv.message_count} messages
                                        </p>
                                    )}
                                </div>
                                <Badge color="blue">SMS</Badge>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {threadMessages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                                        No messages in this conversation.
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
                                                                {new Date(msg.created_at).toLocaleTimeString('en-US', {
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
                                        placeholder="Type a reply... (Enter to send)"
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
                                    Select a conversation
                                </p>
                                <Text className="mt-1">
                                    Choose a conversation from the list to view messages.
                                </Text>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* All Messages View */
                <div className="mt-4">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search number or message..."
                                value={filters.search ?? ''}
                                onChange={(e) => router.get('/sms', { search: e.target.value }, { preserveState: true })}
                            />
                        </div>
                        <div className="w-36">
                            <Select
                                value={filters.direction ?? ''}
                                onChange={(e) => router.get('/sms', { direction: e.target.value }, { preserveState: true })}
                            >
                                <option value="">All</option>
                                <option value="inbound">Inbound</option>
                                <option value="outbound">Outbound</option>
                            </Select>
                        </div>
                    </div>

                    {messagesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
                            <p className="mt-4 text-base font-semibold text-zinc-950">No messages</p>
                            <Text className="mt-2">Messages will appear here when your number receives texts.</Text>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Channel</TableHeader>
                                        <TableHeader>From</TableHeader>
                                        <TableHeader>To</TableHeader>
                                        <TableHeader>Message</TableHeader>
                                        <TableHeader>Direction</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Date</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {messagesList.map((msg) => {
                                        const ch = channelConfig[msg.channel] || channelConfig.sms
                                        const ChIcon = ch.icon
                                        return (
                                            <TableRow key={msg.id}>
                                                <TableCell>
                                                    <Badge color={ch.color}>
                                                        <ChIcon className="mr-1 size-3" />
                                                        {ch.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{msg.from_number}</TableCell>
                                                <TableCell>{msg.to_number}</TableCell>
                                                <TableCell className="max-w-xs truncate">{msg.body}</TableCell>
                                                <TableCell>
                                                    <Badge color={directionColors[msg.direction] || 'zinc'}>
                                                        {msg.direction}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`text-sm font-medium capitalize ${
                                                        statusIcons[msg.status]?.color || 'text-zinc-500'
                                                    }`}>
                                                        {msg.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                            {messages.links && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-1">
                                        {messages.links.map((link, i) => {
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
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <Dialog open={showSend} onClose={() => setShowSend(false)} size="md">
                <DialogTitle>Send Message</DialogTitle>
                <DialogBody>
                    <form id="send-form" onSubmit={handleSend} className="space-y-4">
                        <Field>
                            <Label>Channel</Label>
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
                            <Label>Phone Number</Label>
                            <Input
                                value={data.to}
                                onChange={(e) => setData('to', e.target.value)}
                                placeholder="+12345678900"
                                invalid={errors.to ? true : undefined}
                            />
                            {errors.to && <ErrorMessage>{errors.to}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Message</Label>
                            <Textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Type your message..."
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
                    <Button outline onClick={() => setShowSend(false)}>Cancel</Button>
                    <Button type="submit" form="send-form" disabled={processing}>
                        {processing ? 'Sending...' : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    )
}
