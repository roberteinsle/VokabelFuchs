import { Head, router } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import LeitnerDrawerVisual from '@/components/leitner/LeitnerDrawerVisual';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerStats } from '@/types/models';
import { RotateCcw, X } from 'lucide-react';
import { useState } from 'react';

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

interface ModeMeta {
    label: string;
    due: number;
}

interface Props {
    child: { id: number; name: string; username: string; language_pair: string };
    language_pairs: string[];
    mode_stats: Record<string, DrawerStats>;
    mode_meta: Record<string, ModeMeta>;
    due_count: number;
    balance: number;
    today_earned: number;
    daily_cap_gaming: number;
    daily_cap_youtube: number;
    current_streak: number;
}

export default function ChildHome({ child, language_pairs, mode_stats, mode_meta, due_count, balance, today_earned, daily_cap_gaming, daily_cap_youtube, current_streak }: Props) {
    const [pendingDrawer, setPendingDrawer] = useState<{ mode: string; drawer: number } | null>(null);

    const activeLangPair = language_pairs[0] ?? child.language_pair ?? 'de_en';
    const directionOptions = DIRECTIONS[activeLangPair] ?? DIRECTIONS['de_en'];

    const handleReset = (mode: string, label: string) => {
        if (!confirm(`Alle Karten im Modus „${label}" wirklich auf Fach 1 zurücksetzen?`)) return;
        router.post(route('child.flash-cards.reset'), { mode });
    };

    const handleDrawerClick = (mode: string, drawer: number) => {
        setPendingDrawer({ mode, drawer });
    };

    const startWithDirection = (direction: string) => {
        if (!pendingDrawer) return;
        router.post(route('child.training.start'), {
            training_mode: pendingDrawer.mode,
            drawers: [pendingDrawer.drawer],
            direction,
        });
        setPendingDrawer(null);
    };

    return (
        <ChildLayout>
            <Head title={`Hallo ${child.name}!`} />

            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hallo, {child.name}! 👋</h1>
                    <p className="text-gray-500 mt-1">Bereit zum Lernen?</p>
                </div>

                {/* Streak */}
                {current_streak > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                        <span className="text-2xl">🔥</span>
                        <div>
                            <p className="font-semibold text-orange-700">{current_streak} Tage in Folge!</p>
                            <p className="text-xs text-orange-500">Weiter so!</p>
                        </div>
                    </div>
                )}

                {/* Unified media time balance */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="pt-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dein Guthaben</p>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-purple-700">{balance} <span className="text-base font-normal">min</span></p>
                            <p className="text-xs text-gray-500 mt-1">Einlösbar für 🎮 Gaming oder 📺 YouTube</p>
                        </div>
                        {today_earned > 0 && (
                            <p className="text-xs text-center text-purple-500">Heute verdient: +{today_earned} min</p>
                        )}
                    </CardContent>
                </Card>

                {due_count === 0 && (
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6 text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="font-semibold text-green-800">Heute alles gelernt!</p>
                            <p className="text-sm text-green-600 mt-1">Komm morgen wieder.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Leitner boxes per training mode */}
                {Object.keys(mode_stats).length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-base font-semibold text-gray-700">Deine Karteikästen</h2>
                        {Object.entries(mode_stats).map(([mode, stats]) => {
                            const meta = mode_meta[mode];
                            const totalCards = Object.values(stats).reduce((s, n) => s + n, 0);
                            if (totalCards === 0) return null;
                            return (
                                <Card key={mode}>
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-800">{meta?.label ?? mode}</h3>
                                                {meta?.due > 0 && (
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {meta.due} fällig
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleReset(mode, meta?.label ?? mode)}
                                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                                                title="Auf Fach 1 zurücksetzen"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Reset
                                            </button>
                                        </div>
                                        <LeitnerDrawerVisual
                                            drawerStats={stats}
                                            onDrawerClick={(drawer) => handleDrawerClick(mode, drawer)}
                                        />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Direction picker overlay */}
            {pendingDrawer && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setPendingDrawer(null)}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                        className="relative w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800">Fach {pendingDrawer.drawer} — Richtung wählen</p>
                            <button type="button" onClick={() => setPendingDrawer(null)} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(['forward', 'backward'] as const).map((dir) => {
                                const opt = directionOptions[dir];
                                return (
                                    <button
                                        key={dir}
                                        type="button"
                                        onClick={() => startWithDirection(dir)}
                                        className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all"
                                    >
                                        <span className="text-2xl">{opt.from} → {opt.to}</span>
                                        <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </ChildLayout>
    );
}
