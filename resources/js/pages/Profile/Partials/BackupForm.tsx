import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';

export default function BackupForm({ status }: { status?: string }) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{ file: File | null }>({ file: null });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('file', file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file) setData('file', file);
    };

    const handleRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;
        if (!confirm('Backup einspielen? Bestehende Daten bleiben erhalten, fehlende werden ergänzt.')) return;
        post(route('parent.profile.backup.import'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const restored = status === 'backup-restored';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Backup</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Exportiere alle Daten (Fächer, Vokabeln, Cluster, Kinder, Lernfortschritt) als JSON-Datei.
                    Bei Datenverlust kannst du das Backup in ein neues oder bestehendes Konto einspielen.
                </p>
            </div>

            {/* Export */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <p className="font-medium text-gray-800 text-sm">Backup herunterladen</p>
                    <p className="text-xs text-gray-500">JSON-Datei mit allen Daten</p>
                </div>
                <a
                    href={route('parent.profile.backup.export')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-4 h-4" /> Exportieren
                </a>
            </div>

            {/* Import / Restore */}
            <form onSubmit={handleRestore} className="space-y-3">
                <p className="font-medium text-gray-800 text-sm">Backup einspielen</p>

                {restored && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <RotateCcw className="w-4 h-4" /> Backup wurde erfolgreich eingespielt.
                    </div>
                )}

                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
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
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Upload className={`w-6 h-6 mx-auto mb-1 ${data.file ? 'text-green-500' : 'text-gray-400'}`} />
                    {data.file ? (
                        <p className="text-sm font-medium text-green-700">{data.file.name}</p>
                    ) : (
                        <p className="text-sm text-gray-500">JSON-Backup hier ablegen oder klicken</p>
                    )}
                </div>

                {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}

                <Button type="submit" disabled={!data.file || processing} variant="outline">
                    {processing ? 'Stelle wieder her…' : 'Backup einspielen'}
                </Button>
            </form>
        </div>
    );
}
