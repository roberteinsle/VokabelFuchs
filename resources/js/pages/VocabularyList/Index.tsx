import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkButton } from '@/components/ui/link-button';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface VocabularyList {
    id: number;
    name: string;
    language_pair: string;
    description: string | null;
    vocabularies_count: number;
}

interface LanguagePairOption {
    value: string;
    label: string;
}

interface Props {
    lists: VocabularyList[];
    languagePairs: LanguagePairOption[];
}

export default function VocabularyListIndex({ lists, languagePairs }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        language_pair: languagePairs[0]?.value ?? '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('parent.vocabulary-lists.store'), {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Fach "${name}" und alle darin enthaltenen Vokabeln wirklich löschen?`)) {
            router.delete(route('parent.vocabulary-lists.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Fächer" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Vokabel-Fächer</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4 mr-1" /> Neues Fach
                    </Button>
                </div>

                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Neues Fach anlegen</h2>
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                            <div className="space-y-1">
                                <Label>Name *</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="z.B. Englisch Klasse 4"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Sprache *</Label>
                                <select
                                    value={data.language_pair}
                                    onChange={(e) => setData('language_pair', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    {languagePairs.map((lp) => (
                                        <option key={lp.value} value={lp.value}>{lp.label}</option>
                                    ))}
                                </select>
                                {errors.language_pair && <p className="text-sm text-red-600">{errors.language_pair}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Beschreibung</Label>
                                <Input
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="z.B. Unit 1-3, Schuljahr 2025/26"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => { reset(); setShowForm(false); }}>
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={processing || !data.name}>
                                    Fach anlegen
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {lists.length === 0 && !showForm ? (
                    <div className="text-center py-20 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Noch keine Fächer angelegt.</p>
                        <p className="text-sm mt-1">Lege zuerst ein Fach an (z.B. "Englisch"), dann kannst du Vokabeln hinzufügen.</p>
                        <Button className="mt-4" onClick={() => setShowForm(true)}>
                            <Plus className="w-4 h-4 mr-1" /> Erstes Fach anlegen
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <div key={list.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
                                <div className="flex items-start justify-between">
                                    <LinkButton
                                        href={route('parent.vocabulary-lists.show', list.id)}
                                        variant="ghost"
                                        className="p-0 h-auto hover:bg-transparent text-left flex-1"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {list.name}
                                            </h3>
                                            <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                {languagePairs.find(lp => lp.value === list.language_pair)?.label ?? list.language_pair}
                                            </p>
                                            {list.description && (
                                                <p className="text-sm text-gray-500 mt-1">{list.description}</p>
                                            )}
                                            <p className="text-sm text-gray-400 mt-2">
                                                {list.vocabularies_count} {list.vocabularies_count === 1 ? 'Vokabel' : 'Vokabeln'}
                                            </p>
                                        </div>
                                    </LinkButton>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(list.id, list.name)}
                                        className="text-gray-300 hover:text-red-500 transition-colors ml-2 mt-0.5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
