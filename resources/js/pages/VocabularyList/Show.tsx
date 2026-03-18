import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkButton } from '@/components/ui/link-button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Tag, Vocabulary } from '@/types/models';
import { useState } from 'react';

interface ChildRef {
    id: number;
    name: string;
}

interface TagWithChildren extends Tag {
    vocabularies_count: number;
    children: ChildRef[];
}

interface VocabularyListData {
    id: number;
    name: string;
    language_pair: string;
    description: string | null;
}

interface Props {
    list: VocabularyListData;
    vocabularies: Vocabulary[];
    tags: TagWithChildren[];
    allChildren: ChildRef[];
}

const LANG_LABELS: Record<string, string> = { de_en: 'Englisch', de_fr: 'Französisch' };
const TARGET_LANG: Record<string, 'en' | 'fr'> = { de_en: 'en', de_fr: 'fr' };

function ClusterRow({ tag, list, allChildren }: { tag: TagWithChildren; list: VocabularyListData; allChildren: ChildRef[] }) {
    const [expanded, setExpanded] = useState(false);

    const assignedIds = tag.children.map(c => c.id);
    const unassignedChildren = allChildren.filter(c => !assignedIds.includes(c.id));

    const handleAssign = (childId: number) => {
        router.post(route('parent.vocabulary-lists.tags.children.store', { vocabularyList: list.id, tag: tag.id }), { child_id: childId });
    };

    const handleDetach = (childId: number) => {
        router.delete(route('parent.vocabulary-lists.tags.children.destroy', { vocabularyList: list.id, tag: tag.id, child: childId }));
    };

    const handleDeleteTag = () => {
        if (confirm(`Cluster "${tag.name}" wirklich löschen?`)) {
            router.delete(route('parent.vocabulary-lists.tags.destroy', { vocabularyList: list.id, tag: tag.id }));
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 flex-1 text-left"
                >
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-gray-800">{tag.name}</span>
                    <span className="text-xs text-gray-400">{tag.vocabularies_count} Vokabeln</span>
                </button>
                <div className="flex items-center gap-2">
                    {tag.children.map(child => (
                        <Badge key={child.id} variant="secondary" className="text-xs gap-1">
                            {child.name}
                            <button type="button" onClick={() => handleDetach(child.id)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                        </Badge>
                    ))}
                    <button type="button" onClick={handleDeleteTag} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Kinder diesem Cluster zuweisen
                    </p>
                    {unassignedChildren.length === 0 && tag.children.length === 0 ? (
                        <p className="text-sm text-gray-400">Keine Kinder vorhanden.</p>
                    ) : unassignedChildren.length === 0 ? (
                        <p className="text-sm text-gray-400">Alle Kinder sind bereits zugewiesen.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {unassignedChildren.map(child => (
                                <button
                                    key={child.id}
                                    type="button"
                                    onClick={() => handleAssign(child.id)}
                                    className="px-3 py-1 rounded-full text-sm border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    + {child.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function VocabularyListShow({ list, vocabularies, tags, allChildren }: Props) {
    const [editingName, setEditingName] = useState(false);
    const [showAddCluster, setShowAddCluster] = useState(false);
    const [newClusterName, setNewClusterName] = useState('');

    const { data: nameData, setData: setNameData, put: putName, processing: nameProcessing } = useForm({
        name: list.name,
        description: list.description ?? '',
    });

    const targetLang = TARGET_LANG[list.language_pair] ?? 'en';
    const targetLabel = LANG_LABELS[list.language_pair] ?? list.language_pair;

    // Derived: children in this Fach (assigned to at least one cluster)
    const childrenInFach = allChildren.filter(c =>
        tags.some(t => t.children.some(tc => tc.id === c.id))
    );

    const handleDeleteVocab = (id: number) => {
        if (confirm('Vokabel wirklich löschen?')) {
            router.delete(route('parent.vocabulary.destroy', id));
        }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putName(route('parent.vocabulary-lists.update', list.id), {
            onSuccess: () => setEditingName(false),
        });
    };

    const handleAddCluster = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClusterName.trim()) return;
        router.post(
            route('parent.vocabulary-lists.tags.store', { vocabularyList: list.id }),
            { name: newClusterName.trim() },
            { onSuccess: () => { setNewClusterName(''); setShowAddCluster(false); } }
        );
    };

    return (
        <AppLayout>
            <Head title={list.name} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('parent.vocabulary-lists.index')} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        {editingName ? (
                            <form onSubmit={handleNameSubmit} className="flex gap-2 items-center">
                                <Input
                                    value={nameData.name}
                                    onChange={(e) => setNameData('name', e.target.value)}
                                    className="text-xl font-bold h-auto py-1"
                                    autoFocus
                                />
                                <Button type="submit" size="sm" disabled={nameProcessing}>Speichern</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setEditingName(false)}>Abbrechen</Button>
                            </form>
                        ) : (
                            <div>
                                <button type="button" onClick={() => setEditingName(true)} className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors text-left">
                                    {list.name}
                                </button>
                                <p className="text-sm text-blue-600 font-medium">Deutsch ↔ {targetLabel}</p>
                                {list.description && <p className="text-sm text-gray-500">{list.description}</p>}
                            </div>
                        )}
                    </div>
                    <LinkButton href={route('parent.vocabulary.create', { list_id: list.id })}>
                        <Plus className="w-4 h-4 mr-1" /> Neue Vokabel
                    </LinkButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Vocabulary table */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Vokabeln ({vocabularies.length})</h2>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deutsch</TableHead>
                                        <TableHead>{targetLabel}</TableHead>
                                        <TableHead>Cluster</TableHead>
                                        <TableHead className="w-20">Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vocabularies.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                                                Noch keine Vokabeln.{' '}
                                                <Link href={route('parent.vocabulary.create', { list_id: list.id })} className="text-blue-600 hover:underline">
                                                    Erste Vokabel anlegen
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vocabularies.map((vocab) => (
                                            <TableRow key={vocab.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-1">
                                                        {vocab.word_de}
                                                        <TtsButton text={vocab.word_de} lang="de" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {vocab[`word_${targetLang}` as keyof Vocabulary] && (
                                                        <div className="flex items-center gap-1">
                                                            {vocab[`word_${targetLang}` as keyof Vocabulary] as string}
                                                            <TtsButton text={vocab[`word_${targetLang}` as keyof Vocabulary] as string} lang={targetLang} />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {vocab.tags.map((tag) => (
                                                            <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <LinkButton variant="ghost" size="sm" href={route('parent.vocabulary.edit', vocab.id)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </LinkButton>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVocab(vocab.id)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Right: Clusters + Children */}
                    <div className="space-y-6">
                        {/* Clusters */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">Cluster</h2>
                                <button type="button" onClick={() => setShowAddCluster(!showAddCluster)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    + Neuer Cluster
                                </button>
                            </div>

                            {showAddCluster && (
                                <form onSubmit={handleAddCluster} className="flex gap-2">
                                    <Input
                                        value={newClusterName}
                                        onChange={(e) => setNewClusterName(e.target.value)}
                                        placeholder="z.B. Tiere"
                                        autoFocus
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="sm" disabled={!newClusterName.trim()}>Anlegen</Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => { setShowAddCluster(false); setNewClusterName(''); }}>✕</Button>
                                </form>
                            )}

                            {tags.length === 0 ? (
                                <p className="text-sm text-gray-400">Noch keine Cluster. Füge einen Cluster hinzu, um Kinder zuzuweisen.</p>
                            ) : (
                                <div className="space-y-2">
                                    {tags.map(tag => (
                                        <ClusterRow key={tag.id} tag={tag} list={list} allChildren={allChildren} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Derived: children in this Fach */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-gray-800">Kinder in diesem Fach</h2>
                            {childrenInFach.length === 0 ? (
                                <p className="text-sm text-gray-400">Noch keine Kinder zugewiesen.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {childrenInFach.map(child => {
                                        const childClusters = tags.filter(t => t.children.some(c => c.id === child.id));
                                        return (
                                            <div key={child.id} className="bg-blue-50 rounded-lg px-3 py-2 text-sm">
                                                <span className="font-medium text-blue-800">{child.name}</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {childClusters.map(t => (
                                                        <span key={t.id} className="text-xs text-blue-600 bg-blue-100 rounded px-1.5 py-0.5">{t.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
