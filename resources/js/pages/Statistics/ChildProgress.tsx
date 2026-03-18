import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import ChildLayout from '@/components/layout/ChildLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MODE_LABELS: Record<string, string> = {
    multiple_choice: 'Auswählen',
    free_text:       'Schreiben',
    dictation:       'Hören & Schreiben',
};
const MODE_COLORS: Record<string, string> = {
    multiple_choice: 'bg-blue-500',
    free_text:       'bg-emerald-500',
    dictation:       'bg-purple-500',
};
const MODE_KEYS = ['multiple_choice', 'free_text', 'dictation'];

interface Stats {
    drawer_counts: Record<number, number>;
    drawer_counts_by_mode: Record<string, Record<number, number>>;
    total_cards: number;
    mastered_cards: number;
    total_minutes: number;
    accuracy_percent: number;
    sessions_count: number;
    recent_sessions: { date: string; minutes: number; correct: number; wrong: number }[];
}

interface Props {
    child: { id: number; name: string };
    stats: Stats;
    isParentView?: boolean;
}

function StatsContent({ child, stats }: Props) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Fortschritt: {child.name}</h1>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_cards}</div>
                        <div className="text-xs text-gray-500">Karten gesamt</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.mastered_cards}</div>
                        <div className="text-xs text-gray-500">Gemeistert</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.total_minutes}</div>
                        <div className="text-xs text-gray-500">Min. gelernt</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.accuracy_percent}%</div>
                        <div className="text-xs text-gray-500">Genauigkeit</div>
                    </CardContent>
                </Card>
            </div>

            {/* Drawer distribution per mode */}
            <Card>
                <CardHeader><CardTitle>Kartenverteilung nach Lernmodus</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {MODE_KEYS.map((mode) => {
                        const counts = stats.drawer_counts_by_mode?.[mode] ?? {};
                        const modeTotal = Object.values(counts).reduce((s, n) => s + n, 0);
                        const color = MODE_COLORS[mode];
                        return (
                            <div key={mode}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{MODE_LABELS[mode]}</span>
                                    <span className="text-xs text-gray-400">{modeTotal} Karten</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5].map((d) => {
                                        const count = counts[d] ?? 0;
                                        const pct = modeTotal > 0 ? Math.round((count / modeTotal) * 100) : 0;
                                        return (
                                            <div key={d} className="text-center">
                                                <div className="h-16 bg-gray-100 rounded flex items-end overflow-hidden">
                                                    <div
                                                        className={`w-full ${color} rounded-b transition-all`}
                                                        style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs font-medium mt-1">F{d}</div>
                                                <div className="text-xs text-gray-500">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Recent sessions */}
            {stats.recent_sessions.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Letzte Sitzungen</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.recent_sessions.map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                                    <span className="text-gray-600">{s.date}</span>
                                    <span className="text-gray-500">{s.minutes} min</span>
                                    <span className="text-green-600">✓ {s.correct}</span>
                                    <span className="text-red-500">✗ {s.wrong}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function ChildProgress(props: Props) {
    return (
        <AppLayout>
            <Head title={`Fortschritt ${props.child.name}`} />
            <StatsContent {...props} />
        </AppLayout>
    );
}
