import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/Components/catalyst/alert';
import { invite, update, destroy } from '@/actions/App/Http/Controllers/Web/TeamMemberController';
import { start as impersonateStart } from '@/actions/App/Http/Controllers/Web/ImpersonationController';
import { permissions as permissionsRoute } from '@/routes/team';
import { update as updatePermissionsRoute } from '@/routes/team/permissions';
import { useTranslation } from '@/hooks/useTranslation';

function roleLabel(role, t) {
    const key = `team.roles.${role}`;
    const label = t(key);
    return label === key ? role : label;
}

export default function Index({ members, invitations, currentUser }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'member',
    });

    const [updating, setUpdating] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [confirmingCancel, setConfirmingCancel] = useState(null);
    const [expandedPermissions, setExpandedPermissions] = useState(null);
    const [permissionData, setPermissionData] = useState(null);
    const [permissionLoading, setPermissionLoading] = useState(false);

    function handleInvite(e) {
        e.preventDefault();
        post(invite().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function changeRole(userId, role) {
        setUpdating(userId);
        router.patch(update({ user: userId }).url, { role }, {
            preserveScroll: true,
            onFinish: () => setUpdating(null),
        });
    }

    function remove(userId) {
        setConfirmingDelete(null);
        router.delete(destroy({ user: userId }).url, { preserveScroll: true });
    }

    function cancelInvite(id) {
        setConfirmingCancel(null);
        router.delete(destroy({ user: id }).url, { preserveScroll: true });
    }

    function impersonate(userId) {
        router.post(impersonateStart({ user: userId }).url, {}, {
            preserveScroll: true,
        });
    }

    function togglePermissions(userId) {
        if (expandedPermissions === userId) {
            setExpandedPermissions(null);
            setPermissionData(null);
            return;
        }
        setExpandedPermissions(userId);
        setPermissionLoading(true);
        fetch(permissionsRoute({ user: userId }).url)
            .then((r) => r.json())
            .then((json) => {
                setPermissionData(json);
                setPermissionLoading(false);
            })
            .catch(() => {
                setPermissionLoading(false);
            });
    }

    function toggleOverride(permissionName, granted) {
        if (!permissionData) return;
        const existing = permissionData.overrides.find((o) => o.permission === permissionName);
        if (existing && existing.granted === granted) {
            setPermissionData({
                ...permissionData,
                overrides: permissionData.overrides.filter((o) => o.permission !== permissionName),
            });
        } else {
            const filtered = permissionData.overrides.filter((o) => o.permission !== permissionName);
            setPermissionData({
                ...permissionData,
                overrides: [...filtered, { permission: permissionName, granted }],
            });
        }
    }

    function savePermissions(userId) {
        if (!permissionData) return;
        setPermissionLoading(true);
        router.patch(updatePermissionsRoute({ user: userId }).url, {
            overrides: permissionData.overrides,
        }, {
            preserveScroll: true,
            onFinish: () => setPermissionLoading(false),
        });
    }

    const isOwner = currentUser.role === 'owner';
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    const memberColumns = useMemo(() => {
        const cols = [
            {
                id: 'name',
                header: t('ui.name'),
                cell: (member) => <span className="font-medium">{member.name}</span>,
            },
            {
                id: 'email',
                header: t('team.email'),
                cell: (member) => member.email,
            },
            {
                id: 'role',
                header: t('team.role'),
                cell: (member) => (
                    isOwner && member.id !== currentUser.id ? (
                        <Select
                            value={member.role}
                            onChange={(e) => changeRole(member.id, e.target.value)}
                            disabled={updating === member.id}
                        >
                            <option value="member">{t('team.roles.member')}</option>
                            <option value="admin">{t('team.roles.admin')}</option>
                        </Select>
                    ) : (
                        <Badge color={
                            member.role === 'owner' ? 'yellow'
                                : member.role === 'admin' ? 'blue' : 'zinc'
                        }>
                            {roleLabel(member.role, t)}
                        </Badge>
                    )
                ),
            },
            {
                id: 'joined',
                header: t('ui.joined'),
                cell: (member) => <span className="text-slate-500">{member.joined_at}</span>,
            },
        ];

        if (isOwner || currentUser.canImpersonate) {
            cols.push({
                id: 'actions',
                header: '',
                meta: { align: 'right' },
                cell: (member) => (
                    <div className="flex items-center justify-end gap-2">
                        {currentUser.canImpersonate && member.id !== currentUser.id && (
                            <button
                                type="button"
                                onClick={() => impersonate(member.id)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                {t('ui.impersonate')}
                            </button>
                        )}
                        {canManage && member.id !== currentUser.id && (
                            <button
                                type="button"
                                onClick={() => togglePermissions(member.id)}
                                className="text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                                {expandedPermissions === member.id ? t('ui.close') : t('ui.permissions')}
                            </button>
                        )}
                        {isOwner && member.id !== currentUser.id && (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(member.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                {t('team.remove')}
                            </button>
                        )}
                    </div>
                ),
            });
        }

        return cols;
    }, [t, isOwner, canManage, currentUser, updating, expandedPermissions]);

    const invitationColumns = useMemo(() => {
        const cols = [
            {
                id: 'email',
                header: t('team.email'),
                cell: (inv) => inv.email,
            },
            {
                id: 'role',
                header: t('team.role'),
                cell: (inv) => (
                    <Badge color={inv.role === 'admin' ? 'blue' : 'zinc'}>
                        {roleLabel(inv.role, t)}
                    </Badge>
                ),
            },
            {
                id: 'sent',
                header: t('ui.sent'),
                cell: (inv) => <span className="text-slate-500">{inv.created_at}</span>,
            },
        ];

        if (canManage) {
            cols.push({
                id: 'actions',
                header: '',
                meta: { align: 'right' },
                cell: (inv) => (
                    <button
                        type="button"
                        onClick={() => setConfirmingCancel(inv.id)}
                        className="text-sm font-medium text-slate-500 hover:text-red-600"
                    >
                        {t('ui.cancel')}
                    </button>
                ),
            });
        }

        return cols;
    }, [t, canManage]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.team_title')} />

            <div className="max-w-4xl space-y-6">
                <PageHeader
                    title={t('ui.team_title')}
                    subtitle={t('ui.team_subtitle')}
                />

                {canManage && (
                    <PageSection>
                        <Subheading>{t('ui.invite_member')}</Subheading>
                        <form onSubmit={handleInvite} className="mt-4 flex flex-wrap items-end gap-3">
                            <div className="min-w-0 flex-1">
                                <Field>
                                    <Label>{t('team.email')}</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('ui.email_placeholder')}
                                        invalid={errors.email ? true : undefined}
                                    />
                                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                                </Field>
                            </div>
                            <div>
                                <Field>
                                    <Label>{t('team.role')}</Label>
                                    <Select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                    >
                                        <option value="member">{t('team.roles.member')}</option>
                                        <option value="admin">{t('team.roles.admin')}</option>
                                    </Select>
                                    {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
                                </Field>
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('ui.sending') : t('ui.send_invite')}
                            </Button>
                        </form>
                    </PageSection>
                )}

                <DataTable
                    columns={memberColumns}
                    data={members}
                    getRowId={(row) => row.id}
                    expandedId={expandedPermissions}
                    renderExpandedRow={(member) => (
                        permissionLoading ? (
                            <div className="p-4"><Text>{t('ui.loading_permissions')}</Text></div>
                        ) : permissionData ? (
                            <div className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                    <Subheading>
                                        {t('ui.permission_overrides')} {permissionData.user.name}
                                    </Subheading>
                                    <Button onClick={() => savePermissions(member.id)} disabled={permissionLoading}>
                                        {t('ui.save_label')}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {permissionData.availablePermissions.map((perm) => {
                                        const override = permissionData.overrides.find((o) => o.permission === perm);
                                        const state = override ? (override.granted ? 'granted' : 'revoked') : 'inherit';
                                        return (
                                            <div key={perm} className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2">
                                                <div>
                                                    <Text className="text-sm font-medium">{perm}</Text>
                                                    <Text className="text-xs">
                                                        {state === 'granted' ? (
                                                            <span className="text-green-600">{t('ui.granted_override')}</span>
                                                        ) : state === 'revoked' ? (
                                                            <span className="text-red-600">{t('ui.revoked_override')}</span>
                                                        ) : (
                                                            <span className="text-slate-400">{t('ui.inherited')}</span>
                                                        )}
                                                    </Text>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOverride(perm, true)}
                                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                                            state === 'granted'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                                                        }`}
                                                    >
                                                        {t('ui.grant')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOverride(perm, false)}
                                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                                            state === 'revoked'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                                                        }`}
                                                    >
                                                        {t('ui.revoke')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4"><Text className="text-red-500">{t('ui.failed_permissions')}</Text></div>
                        )
                    )}
                    toolbar={<Subheading>{t('ui.members_count', { count: members.length })}</Subheading>}
                />

                {invitations.length > 0 && (
                    <DataTable
                        columns={invitationColumns}
                        data={invitations}
                        getRowId={(row) => row.id}
                        toolbar={<Subheading>{t('ui.pending_invitations', { count: invitations.length })}</Subheading>}
                    />
                )}
            </div>

            <Alert open={confirmingDelete !== null} onClose={() => setConfirmingDelete(null)}>
                <AlertTitle>{t('ui.remove_member')}</AlertTitle>
                <AlertDescription>
                    {t('ui.remove_member_desc')}
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingDelete(null)}>{t('ui.cancel')}</Button>
                    <Button color="red" onClick={() => remove(confirmingDelete)}>{t('team.remove')}</Button>
                </AlertActions>
            </Alert>

            <Alert open={confirmingCancel !== null} onClose={() => setConfirmingCancel(null)}>
                <AlertTitle>{t('ui.cancel_invitation')}</AlertTitle>
                <AlertDescription>
                    {t('ui.cancel_invitation_desc')}
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingCancel(null)}>{t('ui.keep')}</Button>
                    <Button color="red" onClick={() => cancelInvite(confirmingCancel)}>{t('ui.cancel_invite')}</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
