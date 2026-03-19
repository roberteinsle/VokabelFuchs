import { Head, router } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import LeitnerDrawerVisual from '@/components/leitner/LeitnerDrawerVisual';
import { LinkButton } from '@/components/ui/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerStats } from '@/types/models';
import { Play, RotateCcw } from 'lucide-react';

interface ModeMeta {
    label: string;
    due: number;
}

interface Props {
    child: { id: number; name: string; username: string; language_pair: string };
    mode_stats: Record<string, DrawerStats>;
    mode_meta: Record<string, ModeMeta>;
    due_count: number;
    balance_gaming: number;
    balance_youtube: number;
    daily_cap_gaming: number;
    daily_cap_youtube: number;
    today_earned_gaming: number;
    today_earned_youtube: number;
    current_streak: number;
}

export default function ChildHome({ child, mode_stats, mode_meta, due_count, balance_gaming, balance_youtube, daily_cap_gaming, daily_cap_youtube, today_earned_gaming, today_earned_youtube, current_streak }: Props) {
    const handleReset = (mode: string, label: string) => {
        if (!confirm(`Alle Karten im Modus „${label}" wirklich auf Fach 1 zurücksetzen?`)) return;
        router.post(route('child.flash-cards.reset'), { mode });
    };

    const startDrawer = (mode: string, drawer: number) => {
        router.post(route('child.training.start'), {
            training_mode: mode,
            drawers: [drawer],
            direction: 'forward',
        });
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

                {/* Media time balance with progress bars */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-purple-700">🎮 Gaming</span>
                                <span className="text-xs text-purple-600">{today_earned_gaming} / {daily_cap_gaming} min</span>
                            </div>
                            <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (today_earned_gaming / (daily_cap_gaming || 1)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-2xl font-bold text-purple-700 mt-2">{balance_gaming} <span className="text-sm font-normal">min Guthaben</span></p>
                            {today_earned_gaming >= daily_cap_gaming && daily_cap_gaming > 0 && (
                                <p className="text-xs text-purple-500 mt-1">Voll! 🎉</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-red-700">📺 YouTube</span>
                                <span className="text-xs text-red-600">{today_earned_youtube} / {daily_cap_youtube} min</span>
                            </div>
                            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (today_earned_youtube / (daily_cap_youtube || 1)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-2xl font-bold text-red-700 mt-2">{balance_youtube} <span className="text-sm font-normal">min Guthaben</span></p>
                            {today_earned_youtube >= daily_cap_youtube && daily_cap_youtube > 0 && (
                                <p className="text-xs text-red-500 mt-1">Voll! 🎉</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Start training CTA */}
                {due_count > 0 ? (
                    <Card className="bg-blue-600 border-blue-700 text-white">
                        <CardContent className="pt-6 text-center space-y-3">
                            <p className="text-blue-100 text-sm">Du hast</p>
                            <p className="text-4xl font-bold">{due_count} Karten</p>
                            <p className="text-blue-100 text-sm">die auf dich warten!</p>
                            <LinkButton size="lg" variant="secondary" className="w-full" href={route('child.training.index')}>
                                <Play className="w-5 h-5 mr-2" />
                                Jetzt lernen
                            </LinkButton>
                        </CardContent>
                    </Card>
                ) : (
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
                                            onDrawerClick={(drawer) => startDrawer(mode, drawer)}
                                        />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </ChildLayout>
    );
}
