import { DrawerStats } from '@/types/models';
import { cn } from '@/lib/utils';

interface LeitnerDrawerVisualProps {
    drawerStats: DrawerStats;
    dueCount?: number;
    title?: string;
    onDrawerClick?: (drawer: number) => void;
}

const DRAWER_COLORS = [
    'bg-red-100 border-red-300 text-red-800',
    'bg-orange-100 border-orange-300 text-orange-800',
    'bg-yellow-100 border-yellow-300 text-yellow-800',
    'bg-blue-100 border-blue-300 text-blue-800',
    'bg-green-100 border-green-300 text-green-800',
];

const DRAWER_LABELS = [
    'Täglich',
    'Alle 2 Tage',
    'Alle 5 Tage',
    'Alle 10 Tage',
    'Alle 30 Tage',
];

export default function LeitnerDrawerVisual({ drawerStats, dueCount, title = 'Dein Karteikasten', onDrawerClick }: LeitnerDrawerVisualProps) {
    const totalCards = Object.values(drawerStats).reduce((sum, n) => sum + n, 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                {dueCount !== undefined && dueCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                        {dueCount} fällig
                    </span>
                )}
            </div>

            <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((drawer) => {
                    const count = drawerStats[drawer] ?? 0;
                    const colorClass = DRAWER_COLORS[drawer - 1];

                    return onDrawerClick && count > 0 ? (
                            <button
                                key={drawer}
                                type="button"
                                onClick={() => onDrawerClick(drawer)}
                                className={cn(
                                    'border-2 rounded-lg p-3 text-center transition-all w-full',
                                    'hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer',
                                    colorClass
                                )}
                            >
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-xs font-medium mt-1">Fach {drawer}</div>
                                <div className="text-xs opacity-75 mt-0.5">{DRAWER_LABELS[drawer - 1]}</div>
                            </button>
                        ) : (
                            <div
                                key={drawer}
                                className={cn(
                                    'border-2 rounded-lg p-3 text-center transition-all',
                                    colorClass,
                                    count === 0 && 'opacity-40'
                                )}
                            >
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-xs font-medium mt-1">Fach {drawer}</div>
                                <div className="text-xs opacity-75 mt-0.5">{DRAWER_LABELS[drawer - 1]}</div>
                            </div>
                        );
                })}
            </div>

            {totalCards > 0 && (
                <p className="text-sm text-gray-500 text-center">
                    {totalCards} Karten gesamt · {drawerStats[5] ?? 0} gemeistert
                </p>
            )}
        </div>
    );
}
