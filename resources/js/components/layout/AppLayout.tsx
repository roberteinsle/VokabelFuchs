import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Home, Settings, User, Users } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    const navItems = [
        { href: route('parent.dashboard'), label: 'Übersicht', icon: Home },
        { href: route('parent.children.index'), label: 'Kinder', icon: Users },
        { href: route('parent.vocabulary-lists.index'), label: 'Vokabeln', icon: BookOpen },
        { href: route('parent.media-time-rules.edit'), label: 'Medienzeit', icon: Settings },
        { href: route('parent.profile.edit'), label: 'Mein Profil', icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <Link href={route('parent.dashboard')} className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">VokabelFuchs</span>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Eltern-Bereich</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                url.startsWith(href.replace(window.location.origin, ''))
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}

                    <div className="pl-7 space-y-1 pt-1">
                        <Link
                            href={route('profiles.lock')}
                            method="post"
                            as="button"
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        >
                            Profil wechseln
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        >
                            Abmelden
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
