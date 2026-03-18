import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag } from '@/types/models';
import { Trash2 } from 'lucide-react';

interface Props {
    tags: (Tag & { vocabularies_count: number })[];
}

export default function TagsIndex({ tags }: Props) {
    const { data, setData, post, processing, reset } = useForm({ name: '' });

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Tag "${name}" löschen?`)) {
            router.delete(route('parent.tags.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Tags" />

            <div className="max-w-lg space-y-6">
                <h1 className="text-2xl font-bold">Tags</h1>

                <form onSubmit={(e) => { e.preventDefault(); post(route('parent.tags.store'), { onSuccess: () => reset() }); }}
                    className="flex gap-2">
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Neuer Tag..."
                        required
                    />
                    <Button type="submit" disabled={processing}>Hinzufügen</Button>
                </form>

                <div className="space-y-2">
                    {tags.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">Noch keine Tags vorhanden.</p>
                    ) : (
                        tags.map((tag) => (
                            <div key={tag.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                                <div>
                                    <span className="font-medium text-gray-900">{tag.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">{tag.vocabularies_count} Vokabeln</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(tag.id, tag.name)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
