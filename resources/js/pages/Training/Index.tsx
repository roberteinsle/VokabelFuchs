import { Head, useForm } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Pencil } from 'lucide-react';

interface TrainingModeOption {
    value: string;
    label: string;
}

interface Props {
    child: { name: string };
    due_count: number;
    language_pair: string;
    training_modes: TrainingModeOption[];
}

export default function TrainingIndex({ child, due_count, training_modes }: Props) {
    const { data, setData, post, processing } = useForm({
        training_mode: 'multiple_choice',
    });

    if (due_count === 0) {
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
                        <span className="font-semibold text-blue-600">{due_count} Karten</span> warten auf dich!
                    </p>
                </div>

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
                    <input type="hidden" name="training_mode" value={data.training_mode} />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg"
                        disabled={processing}
                    >
                        Training starten →
                    </Button>
                </form>
            </div>
        </ChildLayout>
    );
}
