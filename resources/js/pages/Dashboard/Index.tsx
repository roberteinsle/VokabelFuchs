import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { BookOpen, Clock, Plus, Star, Users } from 'lucide-react';

const MODE_LABELS: Record<string, string> = {
    multiple_choice: 'Auswählen',
    free_text:       'Schreiben',
    dictation:       'Hören & Schreiben',
};
const MODE_KEYS = ['multiple_choice', 'free_text', 'dictation'];

interface ChildStat {
    id: number;
    name: string;
    language_pair: string;
    drawer_counts: Record<number, number>;
    drawer_counts_by_mode: Record<string, Record<number, number>>;
    total_cards: number;
    mastered_cards: number;
    last_activity: string | null;
    balance: number;
}

interface Props {
    child_stats: ChildStat[];
    vocabulary_count: number;
    tag_count: number;
}

export default function ParentDashboard({ child_stats, vocabulary_count, tag_count }: Props) {
    return (
        <AppLayout>
            <Head title="Dashboard — VokabelFuchs" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Übersicht</h1>
                    <div className="flex gap-2">
                        <LinkButton variant="outline" size="sm" href={route('parent.vocabulary.create')}>
                                <Plus className="w-4 h-4 mr-1" /> Vokabel
                            </LinkButton>
                        <LinkButton size="sm" href={route('parent.children.create')}>
                                <Plus className="w-4 h-4 mr-1" /> Kind
                            </LinkButton>
                    </div>
                </div>

                {/* Stats overview */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-500" />
                                <div>
                                    <div className="text-2xl font-bold">{child_stats.length}</div>
                                    <div className="text-sm text-gray-500">Kinder</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">{vocabulary_count}</div>
                                    <div className="text-sm text-gray-500">Vokabeln</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Star className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {child_stats.reduce((sum, c) => sum + c.mastered_cards, 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">Gemeistert</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Children cards */}
                {child_stats.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 mb-4">Noch keine Kinder angelegt.</p>
                            <LinkButton href={route('parent.children.create')}>Erstes Kind anlegen</LinkButton>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Kinder</h2>
                        {child_stats.map((child) => (
                            <Card key={child.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{child.name}</CardTitle>
                                        <Badge variant="secondary">{child.language_pair}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mb-3">
                                        {MODE_KEYS.map((mode) => {
                                            const counts = child.drawer_counts_by_mode[mode] ?? {};
                                            const total = Object.values(counts).reduce((s, n) => s + n, 0);
                                            if (total === 0) return null;
                                            return (
                                                <div key={mode}>
                                                    <div className="text-xs text-gray-400 mb-1">{MODE_LABELS[mode]}</div>
                                                    <div className="grid grid-cols-5 gap-1">
                                                        {[1, 2, 3, 4, 5].map((d) => (
                                                            <div key={d} className="text-center bg-gray-50 rounded p-1">
                                                                <div className="text-sm font-bold">{counts[d] ?? 0}</div>
                                                                <div className="text-xs text-gray-500">F{d}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(child.drawer_counts_by_mode).length === 0 && (
                                            <div className="grid grid-cols-5 gap-1">
                                                {[1, 2, 3, 4, 5].map((d) => (
                                                    <div key={d} className="text-center bg-gray-50 rounded p-1">
                                                        <div className="text-sm font-bold">0</div>
                                                        <div className="text-xs text-gray-500">F{d}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {child.last_activity
                                                ? new Date(child.last_activity).toLocaleDateString('de-DE')
                                                : 'Noch nicht aktiv'}
                                        </span>
                                        <div className="flex gap-3">
                                            <span>⏱ {child.balance} min Guthaben</span>
                                        </div>
                                        <Link
                                            href={route('parent.children.statistics', { childName: child.name })}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Statistiken →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
