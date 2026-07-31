import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import DataTable from '@/Components/DataTable'
import { Head, router } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import { Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Button } from '@/Components/catalyst/button'
import { Badge } from '@/Components/catalyst/badge'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Alert, AlertDescription } from '@/Components/catalyst/alert'
import { Phone, PhoneOff, Search, Loader2, Check, X, Copy, DollarSign } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { tenant as settingsTenant } from '@/routes/settings'

const COUNTRIES = [
    { code: 'US', label: 'United States' },
    { code: 'MX', label: 'Mexico' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
]

function CapabilityIcon({ enabled }) {
    return enabled
        ? <Check className="size-4 text-emerald-500" />
        : <X className="size-4 text-zinc-300" />
}

export default function Index({ connected, numbers, flows, error }) {
    const { t } = useTranslation()
    const [searchCountry, setSearchCountry] = useState('US')
    const [searchAreaCode, setSearchAreaCode] = useState('')
    const [searchContains, setSearchContains] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)

    const flowMap = {}
    flows.forEach((flow) => {
        if (flow.phone_number) {
            flowMap[flow.phone_number] = flow.name
        }
    })

    const [copied, setCopied] = useState(null)

    function copyNumber(phoneNumber) {
        navigator.clipboard.writeText(phoneNumber).then(() => {
            setCopied(phoneNumber)
            setTimeout(() => setCopied(null), 2000)
        }).catch(() => {})
    }

    function handleSearch(e) {
        e.preventDefault()
        setSearching(true)
        setSearchError(null)

        const params = new URLSearchParams()
        params.set('country', searchCountry)
        if (searchAreaCode.trim()) params.set('area_code', searchAreaCode.trim())
        if (searchContains.trim()) params.set('contains', searchContains.trim())

        fetch(`/settings/phone-numbers/search?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setSearchError(data.error)
                    setSearchResults([])
                } else {
                    setSearchResults(data.numbers || [])
                }
            })
            .catch(() => setSearchError(t('ui.search_failed_retry')))
            .finally(() => setSearching(false))
    }

    const ownedColumns = useMemo(() => [
        {
            id: 'phone',
            header: t('ui.phone_number'),
            meta: { mono: true },
            cell: (number) => (
                <div className="flex items-center gap-2">
                    <span>{number.phone_number}</span>
                    <button
                        onClick={() => copyNumber(number.phone_number)}
                        className="shrink-0 text-zinc-300 hover:text-zinc-500"
                        title={t('ui.copy_number')}
                        type="button"
                    >
                        {copied === number.phone_number
                            ? <Check className="size-3.5 text-emerald-500" />
                            : <Copy className="size-3.5" />
                        }
                    </button>
                </div>
            ),
        },
        {
            id: 'friendly_name',
            header: t('ui.friendly_name'),
            cell: (number) => number.friendly_name,
        },
        {
            id: 'capabilities',
            header: t('ui.capabilities'),
            cell: (number) => (
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs">
                        <CapabilityIcon enabled={number.capabilities?.voice} />
                        {t('ui.voice')}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <CapabilityIcon enabled={number.capabilities?.sms} />
                        {t('ui.sms')}
                    </span>
                </div>
            ),
        },
        {
            id: 'flow',
            header: t('ui.assigned_flow'),
            cell: (number) => (
                flowMap[number.phone_number]
                    ? <Badge>{flowMap[number.phone_number]}</Badge>
                    : <Text className="text-sm text-zinc-400">—</Text>
            ),
        },
        {
            id: 'actions',
            header: t('ui.actions'),
            meta: { align: 'right' },
            cell: (number) => (
                <Button
                    outline
                    onClick={() => {
                        if (confirm(t('ui.release_phone_confirm'))) {
                            router.delete('/settings/phone-numbers/release', {
                                data: { sid: number.sid, phone_number: number.phone_number },
                                preserveScroll: true,
                            })
                        }
                    }}
                >
                    {t('ui.release')}
                </Button>
            ),
        },
    ], [t, copied, flowMap])

    const searchColumns = useMemo(() => [
        {
            id: 'phone',
            header: t('ui.phone_number'),
            meta: { mono: true },
            cell: (number) => number.phone_number,
        },
        {
            id: 'capabilities',
            header: t('ui.capabilities'),
            cell: (number) => (
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs">
                        <CapabilityIcon enabled={number.capabilities?.voice} />
                        {t('ui.voice')}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <CapabilityIcon enabled={number.capabilities?.sms} />
                        {t('ui.sms')}
                    </span>
                </div>
            ),
        },
        {
            id: 'location',
            header: t('ui.location'),
            cell: (number) => [number.locality, number.region].filter(Boolean).join(', ') || '—',
        },
        {
            id: 'price',
            header: t('ui.price'),
            cell: (number) => (
                number.monthly_price
                    ? <span className="flex items-center gap-1 text-sm"><DollarSign className="size-3" />{number.monthly_price}{t('ui.per_mo')}</span>
                    : '—'
            ),
        },
        {
            id: 'actions',
            header: t('ui.actions'),
            meta: { align: 'right' },
            cell: (number) => (
                <Button
                    outline
                    onClick={() => {
                        if (confirm(t('ui.buy_phone_confirm', { number: number.phone_number }))) {
                            router.post('/settings/phone-numbers/buy', {
                                phone_number: number.phone_number,
                            }, { preserveScroll: true })
                        }
                    }}
                >
                    {t('ui.buy_label')}
                </Button>
            ),
        },
    ], [t])

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.phone_numbers')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.phone_numbers')}
                    subtitle={t('ui.phone_numbers_subtitle')}
                />

            {!connected && (
                <Alert>
                    <PhoneOff className="size-5" />
                    <AlertDescription>
                        {t('ui.twilio_credentials_missing')}{' '}
                        <a href={settingsTenant().url} className="font-medium underline">{t('ui.tenant_settings_link')}</a>.
                    </AlertDescription>
                </Alert>
            )}

            {error && connected && (
                <Alert className="mt-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {connected && !error && (
                <>
                    <PageSection>
                        <Subheading>{t('ui.your_numbers')}</Subheading>
                        <Text className="mt-1">{t('ui.your_numbers_desc')}</Text>

                        <div className="mt-4">
                            <DataTable
                                columns={ownedColumns}
                                data={numbers}
                                getRowId={(row) => row.sid}
                                emptyTitle={t('ui.no_phone_numbers_found')}
                                emptyIcon={Phone}
                            />
                        </div>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Search className="size-5 text-slate-500" />
                            <Subheading>{t('ui.buy_number_title')}</Subheading>
                        </div>
                        <Text className="mt-1">{t('ui.buy_number_desc')}</Text>

                        <form onSubmit={handleSearch} className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <Select
                                        value={searchCountry}
                                        onChange={(e) => setSearchCountry(e.target.value)}
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Input
                                        value={searchAreaCode}
                                        onChange={(e) => setSearchAreaCode(e.target.value)}
                                        placeholder={t('ui.area_code_optional')}
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={searchContains}
                                        onChange={(e) => setSearchContains(e.target.value)}
                                        placeholder={t('ui.number_contains_optional')}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={searching}>
                                {searching && <Loader2 className="size-4 animate-spin" />}
                                {searching ? t('ui.searching') : t('ui.search_label')}
                            </Button>
                        </form>

                        {searchError && (
                            <Alert className="mt-4">
                                <AlertDescription>{searchError}</AlertDescription>
                            </Alert>
                        )}

                        {searchResults.length > 0 && (
                            <div className="mt-4">
                                <DataTable
                                    columns={searchColumns}
                                    data={searchResults}
                                    getRowId={(row) => row.phone_number}
                                />
                            </div>
                        )}
                    </PageSection>
                </>
            )}
            </div>
        </AuthenticatedLayout>
    )
}
