import { Inbox } from 'lucide-react';
import { Text } from '@/Components/catalyst/text';

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <Icon className="size-10 text-slate-300" />
            <Text className="text-base font-semibold text-slate-800">{title}</Text>
            {description && <Text className="max-w-md text-slate-500">{description}</Text>}
            {action}
        </div>
    );
}
