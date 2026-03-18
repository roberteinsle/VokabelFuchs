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
    const { data, setData, put, processing, errors } = useForm({ ...rule });

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

                        <Button type="submit" className="w-full" disabled={processing}>
                            Regeln speichern
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
