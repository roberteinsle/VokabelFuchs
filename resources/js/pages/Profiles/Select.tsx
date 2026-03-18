import { Head, router, useForm } from '@inertiajs/react';

interface ParentProfile {
    id: number;
    name: string;
    has_pin: boolean;
}

interface ChildProfile {
    id: number;
    name: string;
}

interface Props {
    parent: ParentProfile;
    children: ChildProfile[];
}

function ProfileCard({ name, avatar, onClick }: { name: string; avatar: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-3 group cursor-pointer"
        >
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-5xl shadow-md group-hover:scale-105 transition-transform">
                {avatar}
            </div>
            <span className="text-gray-800 font-medium text-sm">{name}</span>
        </button>
    );
}

export default function ProfileSelect({ parent, children }: Props) {
    const { post } = useForm();

    const selectProfile = (type: 'parent' | 'child', id: number, hasPin: boolean) => {
        if (!hasPin) {
            // No PIN → unlock directly via POST
            router.post(route('profiles.unlock'), { type, id, pin: '' }, {
                onError: () => {
                    // Has PIN after all, go to PIN screen
                    router.get(route('profiles.pin', { type, id }));
                },
            });
        } else {
            router.get(route('profiles.pin', { type, id }));
        }
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const avatars = ['🦊', '🐻', '🐼', '🦁', '🐯', '🦋', '🐸', '🦉'];

    return (
        <>
            <Head title="Profil wählen" />
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
                <div className="text-4xl mb-2">🦊</div>
                <h1 className="text-white text-2xl font-semibold mb-12">Wer bist du?</h1>

                <div className="flex flex-wrap justify-center gap-10 max-w-2xl">
                    {/* Parent profile */}
                    <div className="flex flex-col items-center gap-1">
                        <ProfileCard
                            name={parent.name}
                            avatar="👤"
                            onClick={() => selectProfile('parent', parent.id, parent.has_pin)}
                        />
                        <span className="text-xs text-gray-500">Elternteil</span>
                    </div>

                    {/* Children profiles */}
                    {children.map((child, i) => (
                        <ProfileCard
                            key={child.id}
                            name={child.name}
                            avatar={avatars[(i + 1) % avatars.length]}
                            onClick={() => selectProfile('child', child.id, true)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-16 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                    Abmelden
                </button>
            </div>
        </>
    );
}
