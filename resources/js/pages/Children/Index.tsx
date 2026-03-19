import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Child } from '@/types/models';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface Props {
    children: Child[];
}

export default function ChildrenIndex({ children }: Props) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`${name} wirklich löschen? Alle Lernfortschritte gehen verloren.`)) {
            router.delete(route('parent.children.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Kinder verwalten" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kinder</h1>
                    <LinkButton href={route('parent.children.create')}>
                        <Plus className="w-4 h-4 mr-1" /> Kind anlegen
                    </LinkButton>
                </div>

                {children.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 mb-4">Noch keine Kinder angelegt.</p>
                            <LinkButton href={route('parent.children.create')}>Kind anlegen</LinkButton>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {children.map((child) => (
                            <Card key={child.id}>
                                <CardContent className="pt-5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{child.name}</span>
                                            {!child.is_active && <Badge variant="destructive">Inaktiv</Badge>}
                                        </div>
                                        {(child.tags_count ?? 0) > 0 && (
                                            <p className="text-sm text-gray-500">{child.tags_count} Cluster zugewiesen</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LinkButton variant="ghost" size="sm" href={route('parent.children.statistics', child.id)}>Statistiken</LinkButton>
                                        <LinkButton variant="ghost" size="sm" href={route('parent.children.edit', child.id)}>
                                            <Pencil className="w-4 h-4" />
                                        </LinkButton>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(child.id, child.name)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
