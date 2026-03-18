import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

interface TagOption {
    id: number;
    name: string;
}

interface ListData {
    id: number;
    name: string;
    language_pair: string;
}

interface Props {
    list: ListData;
    tags: TagOption[];
}

interface PreviewRow {
    de: string;
    target: string;
    valid: boolean;
}

const LANG_LABELS: Record<string, string> = { de_en: 'Englisch', de_fr: 'Französisch' };

export default function VocabularyImport({ list, tags }: Props) {
    const targetLabel = LANG_LABELS[list.language_pair] ?? list.language_pair;
    const [preview, setPreview] = useState<PreviewRow[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        file: File | null;
        tag_id: string;
    }>({
        file: null,
        tag_id: '',
    });

    const parseFile = (file: File) => {
        setData('file', file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            const rows: PreviewRow[] = [];
            for (let i = 0; i < lines.length; i++) {
                const parts = lines[i].split(';');
                const de = parts[0]?.trim() ?? '';
                const target = parts[1]?.trim() ?? '';
                if (i === 0 && de.toLowerCase() === 'deutsch') continue;
                rows.push({ de, target, valid: de !== '' && target !== '' });
            }
            setPreview(rows);
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) parseFile(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('parent.vocabulary-lists.import.store', list.id), {
            forceFormData: true,
        });
    };

    const validCount = preview.filter(r => r.valid).length;
    const invalidCount = preview.filter(r => !r.valid).length;

    return (
        <AppLayout>
            <Head title={`CSV Import – ${list.name}`} />

            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('parent.vocabulary-lists.show', list.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-sm text-gray-500">{list.name}</p>
                        <h1 className="text-2xl font-bold">CSV Import</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                            dragOver
                                ? 'border-blue-400 bg-blue-50'
                                : data.file
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {data.file ? (
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="w-8 h-8 text-green-500" />
                                <span className="font-medium text-green-700">{data.file.name}</span>
                                <span className="text-sm text-gray-500">Andere Datei wählen</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="font-medium text-gray-600">CSV-Datei hier ablegen</span>
                                <span className="text-sm text-gray-400">oder klicken zum Auswählen</span>
                            </div>
                        )}
                    </div>

                    {errors.file && (
                        <p className="text-sm text-red-600">{errors.file}</p>
                    )}

                    {/* Format hint */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                        <p className="font-medium mb-1">Erwartetes Format (Semikolon-getrennt):</p>
                        <code className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5 block whitespace-pre">
{`deutsch;${targetLabel.toLowerCase()};cluster\nHund;dog;Animals\nKatze;cat;Animals\nSchnee;snow;Nature`}
                        </code>
                        <p className="mt-1 text-xs text-gray-400">
                            Die Cluster-Spalte ist optional. Existierende Cluster werden erkannt, neue automatisch angelegt.
                            Headerzeile wird übersprungen.
                        </p>
                    </div>

                    {/* Cluster selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Fallback-Cluster <span className="text-gray-400 font-normal">(für Zeilen ohne Cluster-Spalte)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setData('tag_id', '')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    data.tag_id === ''
                                        ? 'bg-gray-800 text-white border-gray-800'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}
                            >
                                Kein Cluster
                            </button>
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => setData('tag_id', String(tag.id))}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                        data.tag_id === String(tag.id)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 text-blue-600 hover:border-blue-300 bg-blue-50'
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {preview.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">
                                    Vorschau ({validCount} Vokabeln)
                                </h2>
                                {invalidCount > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-amber-600">
                                        <AlertCircle className="w-4 h-4" />
                                        {invalidCount} Zeilen werden übersprungen
                                    </span>
                                )}
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-3 py-2 font-medium text-gray-600">Deutsch</th>
                                            <th className="text-left px-3 py-2 font-medium text-gray-600">{targetLabel}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, i) => (
                                            <tr
                                                key={i}
                                                className={`border-t border-gray-100 ${
                                                    !row.valid ? 'bg-red-50 text-red-400 line-through' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className="px-3 py-1.5">{row.de || '–'}</td>
                                                <td className="px-3 py-1.5">{row.target || '–'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => history.back()}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={!data.file || validCount === 0 || processing}
                        >
                            {processing ? 'Importiere…' : `${validCount > 0 ? validCount + ' ' : ''}Vokabeln importieren`}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
