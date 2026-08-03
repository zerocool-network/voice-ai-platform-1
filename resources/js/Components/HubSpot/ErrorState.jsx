import { Text } from '@/Components/catalyst/text';

export default function ErrorState({ title, message }) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <Text className="font-medium text-red-900">{title}</Text>
            {message && <Text className="mt-1 text-red-800">{message}</Text>}
        </div>
    );
}
