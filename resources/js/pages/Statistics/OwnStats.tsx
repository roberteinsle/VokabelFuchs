import { Head } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
    drawer_counts: Record<number, number>;
    total_cards: number;
    mastered_cards: number;
    total_minutes: number;
    accuracy_percent: number;
    sessions_count: number;
    recent_sessions: { date: string; start_time: string; end_time: string; minutes: number; correct: number; wrong: number }[];
}

interface Props {
    child: { id: number; name: string };
    stats: Stats;
}

export default function OwnStats({ child, stats }: Props) {
    return (
        <ChildLayout>
            <Head title="Mein Fortschritt" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mein Fortschritt</h1>

                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.mastered_cards}</div>
                            <div className="text-xs text-gray-500">Gemeistert 🏆</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.accuracy_percent}%</div>
                            <div className="text-xs text-gray-500">Genauigkeit</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_minutes}</div>
                            <div className="text-xs text-gray-500">Min. gelernt</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.sessions_count}</div>
                            <div className="text-xs text-gray-500">Sitzungen</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Karteikasten</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((d) => {
                                const count = stats.drawer_counts[d] ?? 0;
                                const pct = stats.total_cards > 0 ? (count / stats.total_cards) * 100 : 0;
                                return (
                                    <div key={d} className="flex items-center gap-3">
                                        <span className="text-sm w-14 text-gray-600">Fach {d}</span>
                                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {stats.recent_sessions.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Letzte Lerneinheiten</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {stats.recent_sessions.map((s, i) => (
                                    <div key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 text-sm border-b last:border-0 pb-2 last:pb-0">
                                        <span className="text-gray-600 whitespace-nowrap">{s.date}, {s.start_time} – {s.end_time}</span>
                                        <span className="text-gray-500 whitespace-nowrap">{s.minutes} min</span>
                                        <span className="text-green-600 whitespace-nowrap">✓ {s.correct}</span>
                                        <span className="text-red-500 whitespace-nowrap">✗ {s.wrong}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ChildLayout>
    );
}
