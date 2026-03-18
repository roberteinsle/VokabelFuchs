import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface Props {
    type: 'parent' | 'child';
    id: number;
    profile_name: string;
}

export default function ProfilePin({ type, id, profile_name }: Props) {
    const [digits, setDigits] = useState(['', '', '', '']);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [pinError, setPinError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const next = [...digits];
        next[index] = value;
        setDigits(next);

        if (value && index < 3) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit when all 4 digits filled
        if (value && index === 3 && next.every(d => d)) {
            submitPin(next.join(''));
        }
        if (!value && next.every(d => d) && index !== 3) {
            submitPin(next.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const submitPin = (pin: string) => {
        if (pin.length !== 4) return;
        setProcessing(true);
        router.post(route('profiles.unlock'), { type, id, pin }, {
            onError: () => {
                setPinError('Falscher PIN. Bitte erneut versuchen.');
                setDigits(['', '', '', '']);
                setProcessing(false);
                inputs.current[0]?.focus();
            },
            onSuccess: () => setPinError(null),
        });
    };

    const handleBack = () => {
        router.get(route('profiles.index'));
    };

    const avatars: Record<string, string> = { parent: '👤' };
    const avatar = type === 'parent' ? '👤' : '🦊';

    return (
        <>
            <Head title={`PIN – ${profile_name}`} />
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-4xl">
                        {avatar}
                    </div>
                    <h2 className="text-white text-xl font-semibold">{profile_name}</h2>
                    <p className="text-gray-400 text-sm">PIN eingeben</p>
                </div>

                <div className="flex gap-4 mb-6">
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputs.current[i] = el; }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            autoFocus={i === 0}
                            disabled={processing}
                            className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-700 bg-gray-900 text-white focus:border-blue-500 focus:outline-none"
                        />
                    ))}
                </div>

                {pinError && (
                    <p className="text-red-400 text-sm mb-4">{pinError}</p>
                )}

                <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-4"
                >
                    ← Zurück
                </button>
            </div>
        </>
    );
}
