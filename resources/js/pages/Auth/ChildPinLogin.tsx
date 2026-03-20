import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChildOption {
    id: number;
    name: string;
    username: string;
}

interface Props {
    children: ChildOption[];
}

export default function ChildPinLogin({ children }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        child_id: children[0]?.id ?? '',
        pin: '',
    });

    const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
    const pinDigits = [data.pin[0] ?? '', data.pin[1] ?? '', data.pin[2] ?? '', data.pin[3] ?? ''];

    const handlePinInput = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newPin = [...pinDigits];
        newPin[index] = value;
        setData('pin', newPin.join(''));
        if (value && index < 3) {
            pinRefs[index + 1].current?.focus();
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
            pinRefs[index - 1].current?.focus();
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('child.login.post'), { onError: () => { setData('pin', ''); pinRefs[0].current?.focus(); } });
    };

    return (
        <>
            <Head title="Kind-Login — VokabelFuchs" />
            <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-blue-600">VokabelFuchs</h1>
                        <p className="text-gray-500 mt-2">Wähle deinen Namen und gib deine PIN ein</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Anmelden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {children.length > 0 ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Wer bist du?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {children.map((child) => (
                                                <button
                                                    key={child.id}
                                                    type="button"
                                                    onClick={() => setData('child_id', child.id)}
                                                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                        data.child_id === child.id
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="text-2xl mb-1">👤</div>
                                                    <div className="text-sm font-medium">{child.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Benutzername</label>
                                        <Input
                                            value={data.child_id}
                                            onChange={(e) => setData('child_id', e.target.value as unknown as number)}
                                            placeholder="Benutzername eingeben"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 text-center block">PIN eingeben</label>
                                    <div className="flex gap-3 justify-center">
                                        {[0, 1, 2, 3].map((i) => (
                                            <Input
                                                key={i}
                                                ref={pinRefs[i]}
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={pinDigits[i]}
                                                onChange={(e) => handlePinInput(i, e.target.value)}
                                                onKeyDown={(e) => handlePinKeyDown(i, e)}
                                                className="w-14 h-14 text-center text-2xl font-bold"
                                            />
                                        ))}
                                    </div>
                                    {errors.pin && (
                                        <p className="text-sm text-red-600 text-center">{errors.pin}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg"
                                    disabled={processing || data.pin.length < 4}
                                >
                                    Einloggen
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-gray-500">
                        <a href={route('profiles.index')} className="text-blue-600 hover:underline">Zurück zur Profilauswahl</a>
                    </p>
                </div>
            </div>
        </>
    );
}
