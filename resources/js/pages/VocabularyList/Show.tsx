import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkButton } from '@/components/ui/link-button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronDown, ChevronUp, Download, ImageIcon, Pencil, Plus, Search, Trash2, Upload, Users, X } from 'lucide-react';
import { Tag, Vocabulary } from '@/types/models';
import { useState, useMemo } from 'react';
import axios from 'axios';

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
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(tag.name);

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

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || newName.trim() === tag.name) { setRenaming(false); return; }
        router.patch(
            route('parent.vocabulary-lists.tags.update', { vocabularyList: list.id, tag: tag.id }),
            { name: newName.trim() },
            { onSuccess: () => setRenaming(false) }
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                {renaming ? (
                    <form onSubmit={handleRename} className="flex items-center gap-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="flex-1 text-sm border border-blue-400 rounded px-2 py-1 outline-none"
                            onKeyDown={e => e.key === 'Escape' && setRenaming(false)}
                        />
                        <button type="submit" className="text-xs text-blue-600 font-medium hover:text-blue-800">OK</button>
                        <button type="button" onClick={() => setRenaming(false)} className="text-xs text-gray-400 hover:text-gray-600">Abbrechen</button>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 flex-1 text-left"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        <span className="font-medium text-gray-800">{tag.name}</span>
                        <span className="text-xs text-gray-400">{tag.vocabularies_count} Vokabeln</span>
                    </button>
                )}
                <div className="flex items-center gap-2">
                    {!renaming && tag.children.map(child => (
                        <Badge key={child.id} variant="secondary" className="text-xs gap-1">
                            {child.name}
                            <button type="button" onClick={() => handleDetach(child.id)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                        </Badge>
                    ))}
                    {!renaming && (
                        <button type="button" onClick={() => { setNewName(tag.name); setRenaming(true); }} className="text-gray-300 hover:text-blue-500 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button type="button" onClick={handleDeleteTag} className="text-gray-300 hover:text-red-500 transition-colors">
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
    const [activeFilter, setActiveFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkTagId, setBulkTagId] = useState<string>('');
    const [generatingImages, setGeneratingImages] = useState(false);
    const [imageProgress, setImageProgress] = useState({ done: 0, total: 0 });
    const [vocabImages, setVocabImages] = useState<Record<number, string>>(() => {
        const map: Record<number, string> = {};
        vocabularies.forEach(v => { if (v.image_path) map[v.id] = v.image_path; });
        return map;
    });

    const { data: nameData, setData: setNameData, put: putName, processing: nameProcessing } = useForm({
        name: list.name,
        description: list.description ?? '',
    });

    const targetLang = TARGET_LANG[list.language_pair] ?? 'en';
    const targetLabel = LANG_LABELS[list.language_pair] ?? list.language_pair;

    const childrenInFach = allChildren.filter(c =>
        tags.some(t => t.children.some(tc => tc.id === c.id))
    );

    const filteredVocabs = useMemo(() => {
        let result = activeFilter === null
            ? vocabularies
            : vocabularies.filter(v => v.tags.some(t => t.id === activeFilter));
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(v =>
                v.word_de.toLowerCase().includes(q) ||
                (v[`word_${targetLang}` as keyof Vocabulary] as string | null)?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [vocabularies, activeFilter, searchQuery, targetLang]);

    const allSelected = filteredVocabs.length > 0 && filteredVocabs.every(v => selectedIds.has(v.id));

    const handleFilterChange = (tagId: number | null) => {
        setActiveFilter(tagId);
        setSelectedIds(new Set());
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredVocabs.map(v => v.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };

    const handleDeleteVocab = (id: number) => {
        if (confirm('Vokabel wirklich löschen?')) {
            router.delete(route('parent.vocabulary.destroy', id));
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`${selectedIds.size} Vokabeln wirklich löschen?`)) return;
        router.post(route('parent.vocabulary.bulk-destroy'), { ids: Array.from(selectedIds) }, {
            onSuccess: () => setSelectedIds(new Set()),
        });
    };

    const handleBulkAssignTag = () => {
        if (!bulkTagId) return;
        router.post(route('parent.vocabulary.bulk-assign-tag'), { ids: Array.from(selectedIds), tag_id: parseInt(bulkTagId) }, {
            onSuccess: () => { setSelectedIds(new Set()); setBulkTagId(''); },
        });
    };

    const handleBulkGenerateImages = async () => {
        const ids = Array.from(selectedIds);
        setGeneratingImages(true);
        setImageProgress({ done: 0, total: ids.length });
        for (let i = 0; i < ids.length; i++) {
            try {
                const res = await axios.post(route('parent.vocabulary.generate-image', ids[i]));
                setVocabImages(prev => ({ ...prev, [ids[i]]: res.data.image_path }));
            } catch { /* skip failed */ }
            setImageProgress({ done: i + 1, total: ids.length });
        }
        setGeneratingImages(false);
        setSelectedIds(new Set());
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
                    <div className="flex gap-2">
                        <a
                            href={route('parent.vocabulary-lists.export', list.id)}
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <Download className="w-4 h-4" /> CSV Export
                        </a>
                        <LinkButton variant="outline" href={route('parent.vocabulary-lists.import.create', list.id)}>
                            <Upload className="w-4 h-4 mr-1" /> CSV Import
                        </LinkButton>
                        <LinkButton href={route('parent.vocabulary.create', { list_id: list.id })}>
                            <Plus className="w-4 h-4 mr-1" /> Neue Vokabel
                        </LinkButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Vocabulary table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Vokabeln ({filteredVocabs.length}{activeFilter !== null && ` / ${vocabularies.length}`})
                            </h2>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSelectedIds(new Set()); }}
                                placeholder="Deutsch oder Englisch suchen…"
                                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Cluster filter pills */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange(null)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        activeFilter === null
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Alle ({vocabularies.length})
                                </button>
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleFilterChange(tag.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            activeFilter === tag.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        {tag.name} ({tag.vocabularies_count})
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                <span className="text-sm font-medium text-blue-800">{selectedIds.size} ausgewählt</span>
                                <div className="flex items-center gap-2 ml-auto">
                                    <select
                                        value={bulkTagId}
                                        onChange={(e) => setBulkTagId(e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="">Cluster zuweisen…</option>
                                        {tags.map(tag => (
                                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                                        ))}
                                    </select>
                                    <Button size="sm" variant="outline" onClick={handleBulkAssignTag} disabled={!bulkTagId}>
                                        Zuweisen
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleBulkGenerateImages} disabled={generatingImages}>
                                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                                        {generatingImages ? `${imageProgress.done}/${imageProgress.total}…` : 'Bilder'}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600 border-red-200 hover:bg-red-50">
                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Löschen
                                    </Button>
                                    <button type="button" onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead>Deutsch</TableHead>
                                        <TableHead>{targetLabel}</TableHead>
                                        <TableHead>Cluster</TableHead>
                                        <TableHead className="w-20">Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVocabs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                                                {searchQuery.trim() ? `Keine Vokabeln für „${searchQuery}" gefunden.` : activeFilter !== null ? 'Keine Vokabeln in diesem Cluster.' : (
                                                    <>
                                                        Noch keine Vokabeln.{' '}
                                                        <Link href={route('parent.vocabulary.create', { list_id: list.id })} className="text-blue-600 hover:underline">
                                                            Erste Vokabel anlegen
                                                        </Link>
                                                    </>
                                                )}
                                            </TableCell>

                                        </TableRow>
                                    ) : (
                                        filteredVocabs.map((vocab) => (
                                            <TableRow key={vocab.id} className={selectedIds.has(vocab.id) ? 'bg-blue-50' : undefined}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(vocab.id)}
                                                        onChange={() => toggleSelect(vocab.id)}
                                                        className="rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {vocabImages[vocab.id] && (
                                                            <img src={vocabImages[vocab.id]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                                        )}
                                                        <span>{vocab.word_de}</span>
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
                                                            <button
                                                                key={tag.id}
                                                                type="button"
                                                                onClick={() => handleFilterChange(tag.id)}
                                                                className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded-full px-2 py-0.5 transition-colors"
                                                            >
                                                                {tag.name}
                                                            </button>
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
