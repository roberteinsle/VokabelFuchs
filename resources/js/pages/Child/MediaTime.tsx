import { Head, useForm } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTimeLog } from '@/types/models';

interface Props {
    balance: number;
    daily_cap_gaming: number;
    daily_cap_youtube: number;
    today_spent_gaming: number;
    today_spent_youtube: number;
    logs: MediaTimeLog[];
}

export default function ChildMediaTime({ balance, daily_cap_gaming, daily_cap_youtube, today_spent_gaming, today_spent_youtube, logs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'gaming' as 'gaming' | 'youtube',
        minutes: 30,
    });

    const remainingGaming = Math.max(0, daily_cap_gaming - today_spent_gaming);
    const remainingYoutube = Math.max(0, daily_cap_youtube - today_spent_youtube);
    const maxRedeemable = data.type === 'gaming'
        ? Math.min(balance, remainingGaming)
        : Math.min(balance, remainingYoutube);

    return (
        <ChildLayout>
            <Head title="Medienzeit" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mein Guthaben</h1>

                {/* Unified balance */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dein Guthaben</p>
                        <p className="text-5xl font-bold text-purple-700">{balance}</p>
                        <p className="text-sm text-gray-500 mt-1">Minuten</p>
                        <p className="text-xs text-gray-400 mt-2">Einlösbar für 🎮 Gaming oder 📺 YouTube</p>
                    </CardContent>
                </Card>

                {/* Redeem form */}
                <Card>
                    <CardHeader><CardTitle>Guthaben einlösen</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); post(route('child.media-time.redeem'), { onSuccess: () => reset() }); }}
                            className="space-y-4">
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setData('type', 'gaming')}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                                        data.type === 'gaming' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200'
                                    }`}>
                                    🎮 Gaming
                                    <span className="block text-xs font-normal mt-0.5">
                                        noch {remainingGaming} min heute
                                    </span>
                                </button>
                                <button type="button" onClick={() => setData('type', 'youtube')}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                                        data.type === 'youtube' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'
                                    }`}>
                                    📺 YouTube
                                    <span className="block text-xs font-normal mt-0.5">
                                        noch {remainingYoutube} min heute
                                    </span>
                                </button>
                            </div>
                            <div>
                                <Input type="number" min={1} max={maxRedeemable || 1}
                                    value={data.minutes}
                                    onChange={(e) => setData('minutes', +e.target.value)}
                                    placeholder="Minuten"
                                />
                                {errors.minutes && <p className="text-sm text-red-600 mt-1">{errors.minutes}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing || balance === 0 || maxRedeemable === 0}>
                                {data.minutes} Minuten {data.type === 'gaming' ? 'Gaming' : 'YouTube'} einlösen
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Recent logs */}
                {logs.length > 0 && (
                    <div>
                        <h2 className="font-semibold text-gray-700 mb-2">Letzte Aktivitäten</h2>
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-lg px-3 py-2">
                                    <span>
                                        {log.type === 'gaming' ? '🎮' : log.type === 'youtube' ? '📺' : '⭐'}
                                        {' '}
                                        {log.action === 'earned' ? '+' : '-'}{log.minutes} min
                                    </span>
                                    <span className="text-gray-500">{new Date(log.created_at).toLocaleDateString('de-DE')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ChildLayout>
    );
}
