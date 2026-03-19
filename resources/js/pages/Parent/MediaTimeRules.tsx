import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTimeRule } from '@/types/models';

interface Props {
    rule: MediaTimeRule;
}

export default function MediaTimeRules({ rule }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        ...rule,
        base_minutes_per_correct: rule.base_minutes_per_correct ?? 0.50,
        multiplier_multiple_choice: rule.multiplier_multiple_choice ?? 1.00,
        multiplier_free_text: rule.multiplier_free_text ?? 1.50,
        multiplier_dictation: rule.multiplier_dictation ?? 2.00,
        gaming_exchange_rate: rule.gaming_exchange_rate ?? 1.50,
        youtube_exchange_rate: rule.youtube_exchange_rate ?? 1.00,
        streak_bonus_days: rule.streak_bonus_days ?? 7,
        streak_bonus_minutes: rule.streak_bonus_minutes ?? 15,
    });

    return (
        <AppLayout>
            <Head title="Medienzeit-Regeln" />

            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Medienzeit-Regeln</h1>
                    <p className="text-gray-500 mt-1">Lege fest, wie viel Medienzeit dein Kind durch Lernen verdient.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); put(route('parent.media-time-rules.update')); }}>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>🎮 Gaming</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Minuten lernen</Label>
                                        <Input type="number" min={1} max={120}
                                            value={data.minutes_learn_per_gaming}
                                            onChange={(e) => setData('minutes_learn_per_gaming', +e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>= Minuten Gaming</Label>
                                        <Input type="number" min={1} max={120}
                                            value={data.minutes_gaming_per_learn}
                                            onChange={(e) => setData('minutes_gaming_per_learn', +e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Tages-Maximum Gaming (Minuten)</Label>
                                    <Input type="number" min={0} max={480}
                                        value={data.daily_cap_gaming}
                                        onChange={(e) => setData('daily_cap_gaming', +e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>📺 YouTube</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Minuten lernen</Label>
                                        <Input type="number" min={1} max={120}
                                            value={data.minutes_learn_per_youtube}
                                            onChange={(e) => setData('minutes_learn_per_youtube', +e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>= Minuten YouTube</Label>
                                        <Input type="number" min={1} max={120}
                                            value={data.minutes_youtube_per_learn}
                                            onChange={(e) => setData('minutes_youtube_per_learn', +e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Tages-Maximum YouTube (Minuten)</Label>
                                    <Input type="number" min={0} max={480}
                                        value={data.daily_cap_youtube}
                                        onChange={(e) => setData('daily_cap_youtube', +e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>⚙️ Allgemein</CardTitle></CardHeader>
                            <CardContent>
                                <div>
                                    <Label>Mindest-Lernzeit zum Freischalten (Minuten)</Label>
                                    <Input type="number" min={0} max={60}
                                        value={data.min_learn_for_unlock}
                                        onChange={(e) => setData('min_learn_for_unlock', +e.target.value)} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mindestens diese Lernzeit nötig, um überhaupt Medienzeit zu verdienen.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>📊 Lernmodus-Multiplikatoren</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Basispunkte pro richtiger Antwort (Minuten)</Label>
                                    <Input type="number" min={0.1} max={10} step={0.1}
                                        value={data.base_minutes_per_correct}
                                        onChange={(e) => setData('base_minutes_per_correct', +e.target.value)} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Basis-Lernminuten pro richtiger Antwort vor Multiplikation.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label>Auswählen ×</Label>
                                        <Input type="number" min={0.1} max={5} step={0.1}
                                            value={data.multiplier_multiple_choice}
                                            onChange={(e) => setData('multiplier_multiple_choice', +e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Schreiben ×</Label>
                                        <Input type="number" min={0.1} max={5} step={0.1}
                                            value={data.multiplier_free_text}
                                            onChange={(e) => setData('multiplier_free_text', +e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Diktat ×</Label>
                                        <Input type="number" min={0.1} max={5} step={0.1}
                                            value={data.multiplier_dictation}
                                            onChange={(e) => setData('multiplier_dictation', +e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Gaming-Umrechnungsfaktor</Label>
                                        <Input type="number" min={0.1} max={5} step={0.1}
                                            value={data.gaming_exchange_rate}
                                            onChange={(e) => setData('gaming_exchange_rate', +e.target.value)} />
                                        <p className="text-xs text-gray-500 mt-1">1 Lernmin → × Gaming-min</p>
                                    </div>
                                    <div>
                                        <Label>YouTube-Umrechnungsfaktor</Label>
                                        <Input type="number" min={0.1} max={5} step={0.1}
                                            value={data.youtube_exchange_rate}
                                            onChange={(e) => setData('youtube_exchange_rate', +e.target.value)} />
                                        <p className="text-xs text-gray-500 mt-1">1 Lernmin → × YouTube-min</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>🔥 Streak-Bonus</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Streak-Länge für Bonus (Tage)</Label>
                                        <Input type="number" min={1} max={365}
                                            value={data.streak_bonus_days}
                                            onChange={(e) => setData('streak_bonus_days', +e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Bonus-Minuten</Label>
                                        <Input type="number" min={0} max={120}
                                            value={data.streak_bonus_minutes}
                                            onChange={(e) => setData('streak_bonus_minutes', +e.target.value)} />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Nach {data.streak_bonus_days} Tagen in Folge gibt es {data.streak_bonus_minutes} Bonus-Minuten.
                                </p>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={processing}>
                            Regeln speichern
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
