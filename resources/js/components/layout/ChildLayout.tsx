import { Link, usePage } from '@inertiajs/react';
import { BarChart2, Clock, Home, Power, UserRound } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function ChildLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    const navItems = [
        { href: route('child.home'), label: 'Home', icon: Home },
        { href: route('child.media-time.index'), label: 'Medienzeit', icon: Clock },
        { href: route('child.statistics'), label: 'Fortschritt', icon: BarChart2 },
    ];

    const isActive = (href: string) => url.startsWith(href.replace(window.location.origin, ''));

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
            {/* Top bar: logo + profile switch */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
                    <span className="text-base font-bold text-blue-600">VokabelFuchs</span>
                    <div className="flex items-center gap-1">
                        <Link
                            href={route('profiles.lock')}
                            method="post"
                            as="button"
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <UserRound className="w-4 h-4" />
                            Profil wechseln
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Abmelden"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Power className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-5">
                {children}
            </main>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200">
                <div className="max-w-2xl mx-auto flex">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                                    active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
