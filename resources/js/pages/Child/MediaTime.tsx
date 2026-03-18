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

                {/* Balance cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-6 text-center">
                            <div className="text-4xl mb-2">🎮</div>
                            <div className="text-3xl font-bold text-purple-700">{balance_gaming}</div>
                            <div className="text-sm text-purple-600 mt-1">Minuten Gaming</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-6 text-center">
                            <div className="text-4xl mb-2">📺</div>
                            <div className="text-3xl font-bold text-red-700">{balance_youtube}</div>
                            <div className="text-sm text-red-600 mt-1">Minuten YouTube</div>
                        </CardContent>
                    </Card>
                </div>

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
