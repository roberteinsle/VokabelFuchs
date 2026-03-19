import { Head, useForm } from '@inertiajs/react';
import ChildLayout from '@/components/layout/ChildLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTimeLog } from '@/types/models';
import { useState } from 'react';

interface Props {
    balance_gaming: number;
    balance_youtube: number;
    logs: MediaTimeLog[];
}

export default function ChildMediaTime({ balance_gaming, balance_youtube, logs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'gaming' as 'gaming' | 'youtube',
        minutes: 30,
    });

    return (
        <ChildLayout>
            <Head title="Medienzeit" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mein Guthaben</h1>

                {/* Unified balance */}
                <Card className="bg-gradient-to-br from-purple-50 to-red-50 border-purple-200">
                    <CardContent className="pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dein Guthaben</p>
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                                <div className="text-3xl mb-1">🎮</div>
                                <div className="text-3xl font-bold text-purple-700">{balance_gaming}</div>
                                <div className="text-xs text-purple-500 mt-0.5">min Gaming</div>
                            </div>
                            <div>
                                <div className="text-3xl mb-1">📺</div>
                                <div className="text-3xl font-bold text-red-600">{balance_youtube}</div>
                                <div className="text-xs text-red-400 mt-0.5">min YouTube</div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-3">Du kannst wählen, wofür du dein Guthaben einlöst.</p>
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
                                </button>
                                <button type="button" onClick={() => setData('type', 'youtube')}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                                        data.type === 'youtube' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'
                                    }`}>
                                    📺 YouTube
                                </button>
                            </div>
                            <div>
                                <Input type="number" min={1} max={300}
                                    value={data.minutes}
                                    onChange={(e) => setData('minutes', +e.target.value)}
                                    placeholder="Minuten"
                                />
                                {errors.minutes && <p className="text-sm text-red-600 mt-1">{errors.minutes}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
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
                                        {log.type === 'gaming' ? '🎮' : '📺'}
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
