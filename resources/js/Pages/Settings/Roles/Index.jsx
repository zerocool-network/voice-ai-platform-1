import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { update as updateRole } from '@/routes/settings/roles';
import { Shield } from 'lucide-react';

export default function Index({ roles, allPermissions }) {
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const groups = allPermissions.reduce((acc, p) => {
        const group = p.split('.')[0] || 'other'
        if (!acc[group]) acc[group] = []
        acc[group].push(p)
        return acc
    }, {})

    function openEditor(role) {
        setEditingRole(role);
        setSelectedPermissions([...role.permissions]);
    }

    function togglePermission(name) {
        setSelectedPermissions((prev) =>
            prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
        );
    }

    function saveRole() {
        if (!editingRole) return;
        router.patch(updateRole({ role: editingRole.id }).url, {
            permissions: selectedPermissions,
        }, {
            onSuccess: () => setEditingRole(null),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Roles & Permissions" />

            <div>
                <Heading>Roles &amp; Permissions</Heading>
                <Text className="mt-1">Manage roles and their associated permissions.</Text>
            </div>

            <div className="mt-6 space-y-6">
                {roles.map((role) => (
                    <div key={role.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold capitalize text-zinc-950 dark:text-white">{role.name}</h3>
                                <Text className="text-sm">{role.users_count} user{role.users_count !== 1 ? 's' : ''}</Text>
                            </div>
                            <Button outline onClick={() => openEditor(role)}>Edit Permissions</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {role.permissions.map((p) => (
                                <Badge key={p} color="zinc">{p}</Badge>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={editingRole !== null} onClose={() => setEditingRole(null)} size="lg">
                <DialogTitle>Edit {editingRole?.name} Permissions</DialogTitle>
                <DialogDescription>
                    {editingRole?.name === 'owner'
                        ? 'Owner permissions cannot be modified.'
                        : 'Select which permissions this role should have.'}
                </DialogDescription>
                <DialogBody>
                    <div className="space-y-4">
                        {Object.entries(groups).map(([group, perms]) => (
                            <div key={group}>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{group}</h4>
                                <div className="space-y-1">
                                    {perms.map((perm) => (
                                        <label key={perm} className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-zinc-50">
                                            <Checkbox
                                                checked={selectedPermissions.includes(perm)}
                                                onChange={() => togglePermission(perm)}
                                                disabled={editingRole?.name === 'owner'}
                                            />
                                            <span className="text-sm">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setEditingRole(null)}>Cancel</Button>
                    <Button onClick={saveRole} disabled={editingRole?.name === 'owner'}>Save</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
