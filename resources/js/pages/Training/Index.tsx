import { Head, useForm } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, Pencil } from 'lucide-react';

interface TrainingModeOption {
    value: string;
    label: string;
}

interface Cluster {
    tag_id: number;
    tag_name: string;
    fach_name: string | null;
    language_pair: string | null;
    due_count: number;
}

interface Props {
    child: { name: string };
    due_count: number;
    clusters: Cluster[];
    training_modes: TrainingModeOption[];
}

export default function TrainingIndex({ child, due_count, clusters, training_modes }: Props) {
    const { data, setData, post, processing } = useForm({
        training_mode: 'multiple_choice',
        tag_id: null as number | null,
    });

    const hasClusters = clusters.length > 0;
    const selectedCluster = data.tag_id ? clusters.find(c => c.tag_id === data.tag_id) : null;
    const effectiveDueCount = selectedCluster ? selectedCluster.due_count : due_count;

    if (due_count === 0 && !hasClusters) {
        return (
            <ChildLayout>
                <Head title="Training" />
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-gray-800">Alles gelernt!</h2>
                    <p className="text-gray-500 mt-2">Keine Karten fällig. Komm morgen wieder.</p>
                </div>
            </ChildLayout>
        );
    }

    return (
        <ChildLayout>
            <Head title="Training starten" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training starten</h1>
                    <p className="text-gray-500 mt-1">
                        {effectiveDueCount > 0 ? (
                            <><span className="font-semibold text-blue-600">{effectiveDueCount} Karten</span> warten auf dich!</>
                        ) : (
                            'Keine fälligen Karten für diese Auswahl.'
                        )}
                    </p>
                </div>

                {/* Cluster picker (only shown if child has multiple clusters) */}
                {hasClusters && clusters.length > 1 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-gray-700">Fach / Cluster wählen:</h2>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setData('tag_id', null)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                                    data.tag_id === null
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className="font-medium text-gray-800">Alle fälligen Karten</span>
                                <span className="text-sm text-gray-500">{due_count} fällig</span>
                            </button>
                            {clusters.map((cluster) => (
                                <button
                                    key={cluster.tag_id}
                                    type="button"
                                    onClick={() => setData('tag_id', cluster.tag_id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                                        data.tag_id === cluster.tag_id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div>
                                        <span className="font-medium text-gray-800">{cluster.tag_name}</span>
                                        {cluster.fach_name && (
                                            <span className="text-xs text-gray-400 ml-2">{cluster.fach_name}</span>
                                        )}
                                    </div>
                                    <span className={`text-sm ${cluster.due_count > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                        {cluster.due_count} fällig
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mode picker */}
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-700">Lernmodus wählen:</h2>
                    {training_modes.map((mode) => (
                        <button
                            key={mode.value}
                            type="button"
                            onClick={() => setData('training_mode', mode.value)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                data.training_mode === mode.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                data.training_mode === mode.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {mode.value === 'multiple_choice' ? <BookOpen className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">{mode.label}</div>
                                <div className="text-xs text-gray-500">
                                    {mode.value === 'multiple_choice' ? 'Wähle die richtige Antwort aus 4 Optionen' : 'Tippe die Übersetzung selbst ein'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); post(route('child.training.start')); }}>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg"
                        disabled={processing || effectiveDueCount === 0}
                    >
                        Training starten →
                    </Button>
                </form>
            </div>
        </ChildLayout>
    );
}
