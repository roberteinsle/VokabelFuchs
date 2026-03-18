import { Head, useForm } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, Pencil, Volume2 } from 'lucide-react';
import type { ReactNode } from 'react';

const MODE_META: Record<string, { icon: ReactNode; label: string; desc: string }> = {
    multiple_choice: { icon: <BookOpen className="w-5 h-5" />, label: 'Auswählen',        desc: '4 Antworten' },
    free_text:       { icon: <Pencil   className="w-5 h-5" />, label: 'Schreiben',         desc: 'Selbst tippen' },
    dictation:       { icon: <Volume2  className="w-5 h-5" />, label: 'Hören & Schreiben', desc: 'Diktat' },
};

const DRAWER_LABELS = ['Täglich', 'Alle 2 Tage', 'Alle 5 Tage', 'Alle 10 Tage', 'Alle 30 Tage'];

const DIRECTIONS: Record<string, { forward: { label: string; from: string; to: string }; backward: { label: string; from: string; to: string } }> = {
    de_en: {
        forward:  { label: 'Ins Englische',    from: '🇩🇪', to: '🇬🇧' },
        backward: { label: 'Ins Deutsche',      from: '🇬🇧', to: '🇩🇪' },
    },
    de_fr: {
        forward:  { label: 'Ins Französische', from: '🇩🇪', to: '🇫🇷' },
        backward: { label: 'Ins Deutsche',      from: '🇫🇷', to: '🇩🇪' },
    },
};

interface TrainingModeOption { value: string; label: string; }
interface Cluster { tag_id: number; tag_name: string; fach_name: string | null; language_pair: string | null; due_by_mode: Record<string, number>; }
interface Props { child: { name: string }; due_by_mode: Record<string, number>; clusters: Cluster[]; training_modes: TrainingModeOption[]; }

export default function TrainingIndex({ child, due_by_mode, clusters, training_modes }: Props) {
    const { data, setData, post, processing } = useForm({
        training_mode: 'multiple_choice',
        tag_id: null as number | null,
        direction: 'forward',
        drawers: [] as number[],
    });

    const toggleDrawer = (d: number) => {
        const next = data.drawers.includes(d)
            ? data.drawers.filter(x => x !== d)
            : [...data.drawers, d];
        setData('drawers', next);
    };

    const hasClusters = clusters.length > 0;
    const selectedCluster = data.tag_id ? clusters.find(c => c.tag_id === data.tag_id) : null;
    const activeLangPair = selectedCluster?.language_pair ?? clusters[0]?.language_pair ?? 'de_en';
    const directionOptions = DIRECTIONS[activeLangPair] ?? DIRECTIONS['de_en'];

    // Due count for the currently selected mode (ignores drawer filter for display)
    const modeDueTotal = due_by_mode[data.training_mode] ?? 0;
    const modeDueCluster = selectedCluster?.due_by_mode[data.training_mode] ?? 0;
    const effectiveDueCount = selectedCluster ? modeDueCluster : modeDueTotal;

    const usingDrawerFilter = data.drawers.length > 0;
    const canStart = processing ? false : usingDrawerFilter ? true : effectiveDueCount > 0;

    const totalDueAllModes = Object.values(due_by_mode).reduce((s, n) => s + n, 0);

    if (totalDueAllModes === 0 && !hasClusters) {
        return (
            <ChildLayout>
                <Head title="Training" />
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-gray-800">Alles gelernt!</h2>
                    <p className="text-gray-500 mt-2">Keine Karten fällig. Komm morgen wieder.</p>
                </div>
            </ChildLayout>
        );
    }

    return (
        <ChildLayout>
            <Head title="Training starten" />

            <div className="pb-24 space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training starten</h1>
                    <p className="mt-1 text-base">
                        {usingDrawerFilter ? (
                            <span className="font-semibold text-amber-600">Fach {data.drawers.sort().join(', ')} ausgewählt</span>
                        ) : effectiveDueCount > 0 ? (
                            <><span className="font-semibold text-blue-600">{effectiveDueCount} Karten</span> warten auf dich!</>
                        ) : (
                            <span className="text-gray-400">Keine fälligen Karten — wähle Fächer unten.</span>
                        )}
                    </p>
                </div>

                {/* Cluster picker */}
                {hasClusters && clusters.length > 1 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cluster</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setData('tag_id', null)}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap ${
                                    data.tag_id === null ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 text-gray-600 bg-white'
                                }`}
                            >
                                Alle
                                <span className={`text-xs ${data.tag_id === null ? 'text-blue-100' : 'text-gray-400'}`}>{modeDueTotal}</span>
                            </button>
                            {clusters.map(c => {
                                const cnt = c.due_by_mode[data.training_mode] ?? 0;
                                return (
                                    <button
                                        key={c.tag_id}
                                        type="button"
                                        onClick={() => setData('tag_id', c.tag_id)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap ${
                                            data.tag_id === c.tag_id ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 text-gray-600 bg-white'
                                        }`}
                                    >
                                        {c.tag_name}
                                        <span className={`text-xs ${data.tag_id === c.tag_id ? 'text-blue-100' : cnt > 0 ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                                            {cnt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Mode picker */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Lernmodus</p>
                    <div className="space-y-2">
                        {training_modes.map((mode) => {
                            const meta = MODE_META[mode.value];
                            const active = data.training_mode === mode.value;
                            return (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => setData('training_mode', mode.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                                        active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {meta?.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 text-sm">{meta?.label ?? mode.label}</div>
                                        <div className="text-xs text-gray-400">{meta?.desc}</div>
                                    </div>
                                    {active && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Direction picker */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Zielsprache</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['forward', 'backward'] as const).map((dir) => {
                            const opt = directionOptions[dir];
                            const active = data.direction === dir;
                            return (
                                <button
                                    key={dir}
                                    type="button"
                                    onClick={() => setData('direction', dir)}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                                        active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-2xl">{opt.from} → {opt.to}</span>
                                    <span className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-gray-600'}`}>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Drawer picker */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fächer üben</p>
                    <p className="text-xs text-gray-400">Standard: nur fällige Karten. Fächer wählen um auch nicht-fällige zu üben.</p>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((d) => {
                            const active = data.drawers.includes(d);
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDrawer(d)}
                                    className={`flex flex-col items-center py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                                        active
                                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="font-bold text-sm">{d}</span>
                                    <span className="opacity-70 mt-0.5">{DRAWER_LABELS[d - 1].replace('Alle ', '').replace('Täglich', 'tägl.')}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Sticky start button */}
            <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
                <form onSubmit={(e) => { e.preventDefault(); post(route('child.training.start')); }}>
                    <Button
                        type="submit"
                        className={`w-full h-12 text-base font-semibold ${usingDrawerFilter ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                        disabled={!canStart}
                    >
                        Training starten →
                    </Button>
                </form>
            </div>
        </ChildLayout>
    );
}
