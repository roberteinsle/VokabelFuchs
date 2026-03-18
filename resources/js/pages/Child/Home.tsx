import { Head } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import LeitnerDrawerVisual from '@/components/leitner/LeitnerDrawerVisual';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerStats } from '@/types/models';
import { Play } from 'lucide-react';

interface Props {
    child: { id: number; name: string; username: string; language_pair: string };
    drawer_stats: DrawerStats;
    due_count: number;
    balance_gaming: number;
    balance_youtube: number;
}

export default function ChildHome({ child, drawer_stats, due_count, balance_gaming, balance_youtube }: Props) {
    return (
        <ChildLayout>
            <Head title={`Hallo ${child.name}!`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hallo, {child.name}! 👋</h1>
                    <p className="text-gray-500 mt-1">Bereit zum Lernen?</p>
                </div>

                {/* Media time balance */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-4 text-center">
                            <div className="text-3xl mb-1">🎮</div>
                            <div className="text-2xl font-bold text-purple-700">{balance_gaming}</div>
                            <div className="text-xs text-purple-600">Minuten Gaming</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-4 text-center">
                            <div className="text-3xl mb-1">📺</div>
                            <div className="text-2xl font-bold text-red-700">{balance_youtube}</div>
                            <div className="text-xs text-red-600">Minuten YouTube</div>
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

                {/* Leitner visual */}
                <Card>
                    <CardContent className="pt-6">
                        <LeitnerDrawerVisual drawerStats={drawer_stats} dueCount={due_count} />
                    </CardContent>
                </Card>
            </div>
        </ChildLayout>
    );
}
