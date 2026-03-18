import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    language_pairs: { value: string; label: string }[];
}

export default function ChildCreate({ language_pairs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        pin: '',
        language_pair: 'de_en',
    });

    return (
        <AppLayout>
            <Head title="Kind anlegen" />

            <div className="max-w-lg space-y-6">
                <h1 className="text-2xl font-bold">Kind anlegen</h1>

                <form onSubmit={(e) => { e.preventDefault(); post(route('parent.children.store')); }}>
                    <Card>
                        <CardHeader><CardTitle>Kind-Profil</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="z.B. Emma"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="username">Benutzername *</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value.toLowerCase())}
                                    placeholder="z.B. emma"
                                    required
                                />
                                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="pin">PIN (4 Ziffern) *</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={data.pin}
                                    onChange={(e) => setData('pin', e.target.value.replace(/\D/g, ''))}
                                    placeholder="1234"
                                    required
                                />
                                {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="language_pair">Sprache</Label>
                                <select
                                    id="language_pair"
                                    value={data.language_pair}
                                    onChange={(e) => setData('language_pair', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    {language_pairs.map((lp) => (
                                        <option key={lp.value} value={lp.value}>{lp.label}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => history.back()}>Abbrechen</Button>
                        <Button type="submit" disabled={processing}>Kind anlegen</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
