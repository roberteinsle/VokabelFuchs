import { Head, Link, router } from '@inertiajs/react';

interface Profile {
    type: 'parent' | 'child';
    id: number;
    name: string;
    has_pin?: boolean;
}

interface Props {
    profiles: Profile[];
    hasUsers: boolean;
}

const AVATARS = ['🐻', '🐼', '🦁', '🐯', '🦋', '🐸', '🦉', '🐧', '🦊'];

function ProfileCard({ name, avatar, label, onClick }: { name: string; avatar: string; label?: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-3 group cursor-pointer"
        >
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-5xl shadow-md group-hover:scale-105 transition-transform">
                {avatar}
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-gray-800 font-medium text-sm">{name}</span>
                {label && <span className="text-xs text-gray-400">{label}</span>}
            </div>
        </button>
    );
}

export default function ProfileSelect({ profiles, hasUsers }: Props) {
    const selectProfile = (profile: Profile) => {
        router.get(route('profiles.pin', { type: profile.type, id: profile.id }));
    };

    let childIndex = 0;

    return (
        <>
            <Head title="Wer bist du?" />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6">
                <div className="text-4xl mb-2">🦊</div>
                <h1 className="text-gray-900 text-2xl font-semibold mb-12">Wer bist du?</h1>

                {!hasUsers ? (
                    <div className="flex flex-col items-center gap-6 text-center">
                        <p className="text-gray-500 text-sm max-w-xs">
                            Noch keine Profile angelegt. Registriere dich, um loszulegen.
                        </p>
                        <Link
                            href={route('register')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Jetzt registrieren
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-10 max-w-2xl">
                        {profiles.map((profile) => {
                            const isParent = profile.type === 'parent';
                            const avatar = isParent ? '👤' : AVATARS[childIndex++ % AVATARS.length];
                            return (
                                <ProfileCard
                                    key={`${profile.type}-${profile.id}`}
                                    name={profile.name}
                                    avatar={avatar}
                                    label={isParent ? 'Elternteil' : undefined}
                                    onClick={() => selectProfile(profile)}
                                />
                            );
                        })}
                    </div>
                )}

                <p className="mt-16 text-xs text-gray-300">V. 1.0.2</p>
            </div>
        </>
    );
}
