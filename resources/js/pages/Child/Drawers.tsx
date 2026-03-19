import { Head } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import LeitnerDrawerVisual from '@/components/leitner/LeitnerDrawerVisual';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { DrawerStats } from '@/types/models';

interface Props {
    drawer_stats: DrawerStats;
    due_count: number;
    intervals: Record<number, number>;
}

export default function ChildDrawers({ drawer_stats, due_count, intervals }: Props) {
    return (
        <ChildLayout>
            <Head title="Mein Karteikasten" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mein Karteikasten</h1>

                <LeitnerDrawerVisual drawerStats={drawer_stats} dueCount={due_count} />

                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <h3 className="font-semibold text-gray-700">Wie funktioniert das?</h3>
                    {Object.entries(intervals).map(([drawer, days]) => (
                        <div key={drawer} className="flex justify-between text-sm">
                            <span className="text-gray-700">Fach {drawer}</span>
                            <span className="text-gray-500">
                                {+drawer === 1 ? 'täglich' : `alle ${days} Tage`}
                            </span>
                        </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-2">
                        Richtige Antwort → ein Fach höher | Falsche Antwort → zurück zu Fach 1
                    </p>
                </div>

                {due_count > 0 && (
                    <LinkButton className="w-full" href={route('child.home')}>
                            {due_count} Karten lernen →
                        </LinkButton>
                )}
            </div>
        </ChildLayout>
    );
}
