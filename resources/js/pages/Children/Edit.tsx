import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Child } from '@/types/models';

interface Props {
    child: Child;
    language_pairs: { value: string; label: string }[];
}

export default function ChildEdit({ child, language_pairs }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: child.name,
        username: child.username,
        pin: '',
        language_pair: child.language_pair,
    });

    return (
        <AppLayout>
            <Head title={`${child.name} bearbeiten`} />

            <div className="max-w-lg space-y-6">
                <h1 className="text-2xl font-bold">{child.name} bearbeiten</h1>

                <form onSubmit={(e) => { e.preventDefault(); put(route('parent.children.update', child.id)); }}>
                    <Card>
                        <CardHeader><CardTitle>Kind-Profil</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Name *</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Benutzername *</Label>
                                <Input value={data.username} onChange={(e) => setData('username', e.target.value.toLowerCase())} required />
                                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Neue PIN (leer lassen = unverändert)</Label>
                                <Input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={data.pin}
                                    onChange={(e) => setData('pin', e.target.value.replace(/\D/g, ''))}
                                    placeholder="Neue PIN..."
                                />
                                {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Sprache</Label>
                                <select
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
                        <Button type="submit" disabled={processing}>Speichern</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
