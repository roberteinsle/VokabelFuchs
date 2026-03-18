import { Head } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { TrainingSession } from '@/types/models';

interface Props {
    session: TrainingSession & {
        duration_minutes: number;
        media_time_earned_gaming: number;
        media_time_earned_youtube: number;
    };
}

export default function TrainingSummary({ session }: Props) {
    const total = session.cards_correct + session.cards_wrong;
    const accuracy = total > 0 ? Math.round((session.cards_correct / total) * 100) : 0;
    const earnedAny = session.media_time_earned_gaming > 0 || session.media_time_earned_youtube > 0;

    return (
        <ChildLayout>
            <Head title="Ergebnis" />

            <div className="space-y-6 text-center">
                <div>
                    <div className="text-6xl mb-2">{accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</div>
                    <h1 className="text-2xl font-bold text-gray-900">Training abgeschlossen!</h1>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-600">{session.cards_correct}</div>
                            <div className="text-xs text-gray-500">Richtig</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-red-500">{session.cards_wrong}</div>
                            <div className="text-xs text-gray-500">Falsch</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                            <div className="text-xs text-gray-500">Genauigkeit</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <div className="text-lg text-gray-700">⏱ {session.duration_minutes} Minuten gelernt</div>
                    </CardContent>
                </Card>

                {earnedAny && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-4 space-y-1">
                            <p className="font-semibold text-yellow-800">Medienzeit verdient! 🏆</p>
                            {session.media_time_earned_gaming > 0 && (
                                <p className="text-yellow-700">🎮 +{session.media_time_earned_gaming} Minuten Gaming</p>
                            )}
                            {session.media_time_earned_youtube > 0 && (
                                <p className="text-yellow-700">📺 +{session.media_time_earned_youtube} Minuten YouTube</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-3">
                    <LinkButton variant="outline" className="flex-1" href={route('child.home')}>Zum Menü</LinkButton>
                    <LinkButton className="flex-1" href={route('child.training.index')}>Nochmal lernen</LinkButton>
                </div>
            </div>
        </ChildLayout>
    );
}
