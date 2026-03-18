import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Vocabulary, Tag } from '@/types/models';
import { useState } from 'react';

interface Props {
    vocabularies: {
        data: Vocabulary[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    tags: Tag[];
    filters: { search?: string; tag?: string };
}

export default function VocabularyIndex({ vocabularies, tags, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('parent.vocabulary.index'), { search, tag: filters.tag }, { preserveState: true });
    };

    const handleTagFilter = (tagId: string) => {
        router.get(route('parent.vocabulary.index'), { search, tag: tagId || undefined }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Vokabel wirklich löschen?')) {
            router.delete(route('parent.vocabulary.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Vokabeln" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Vokabeln ({vocabularies.total})</h1>
                    <LinkButton href={route('parent.vocabulary.create')}>
                            <Plus className="w-4 h-4 mr-1" /> Neue Vokabel
                        </LinkButton>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <Input
                            placeholder="Suchen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        <Button type="submit" variant="outline" size="sm">Suchen</Button>
                    </form>
                    <select
                        onChange={(e) => handleTagFilter(e.target.value)}
                        value={filters.tag ?? ''}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    >
                        <option value="">Alle Tags</option>
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Deutsch</TableHead>
                                <TableHead>Englisch</TableHead>
                                <TableHead>Französisch</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="w-24">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vocabularies.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Keine Vokabeln gefunden.{' '}
                                        <Link href={route('parent.vocabulary.create')} className="text-blue-600 hover:underline">
                                            Erste Vokabel anlegen
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vocabularies.data.map((vocab) => (
                                    <TableRow key={vocab.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-1">
                                                {vocab.word_de}
                                                <TtsButton text={vocab.word_de} lang="de" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {vocab.word_en && (
                                                <div className="flex items-center gap-1">
                                                    {vocab.word_en}
                                                    <TtsButton text={vocab.word_en} lang="en" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {vocab.word_fr && (
                                                <div className="flex items-center gap-1">
                                                    {vocab.word_fr}
                                                    <TtsButton text={vocab.word_fr} lang="fr" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {vocab.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="secondary" className="text-xs">
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <LinkButton variant="ghost" size="sm" href={route('parent.vocabulary.edit', vocab.id)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </LinkButton>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(vocab.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
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

                {/* Pagination */}
                {vocabularies.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {vocabularies.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 text-sm rounded border ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span key={i} className="px-3 py-1 text-sm rounded border border-gray-200 text-gray-400"
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
