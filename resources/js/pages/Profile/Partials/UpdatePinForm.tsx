import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
    hasPin: boolean;
}

export default function UpdatePinForm({ hasPin }: Props) {
    const { data, setData, post, errors, processing, reset, recentlySuccessful } = useForm({
        pin: '',
        pin_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('parent.profile.pin.update'), {
            onSuccess: () => reset(),
        });
    };

    const removePin = () => {
        post(route('parent.profile.pin.remove'));
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profil-PIN</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {hasPin
                        ? 'Dein Profil ist mit einem PIN geschützt. Du kannst ihn hier ändern oder entfernen.'
                        : 'Lege einen 4-stelligen PIN fest, um dein Eltern-Profil zu schützen.'}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-4 max-w-xs">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {hasPin ? 'Neuer PIN' : 'PIN festlegen'}
                    </label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={data.pin}
                        onChange={e => setData('pin', e.target.value)}
                        placeholder="4 Ziffern"
                    />
                    {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN wiederholen</label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={data.pin_confirmation}
                        onChange={e => setData('pin_confirmation', e.target.value)}
                        placeholder="4 Ziffern"
                    />
                </div>
                <div className="flex gap-3 items-center">
                    <Button type="submit" disabled={processing}>
                        {hasPin ? 'PIN ändern' : 'PIN setzen'}
                    </Button>
                    {recentlySuccessful && <span className="text-sm text-green-600">Gespeichert.</span>}
                    {hasPin && (
                        <button
                            type="button"
                            onClick={removePin}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            PIN entfernen
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}
