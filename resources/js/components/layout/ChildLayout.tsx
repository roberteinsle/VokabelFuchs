import { Link, usePage } from '@inertiajs/react';
import { BarChart2, BookOpen, Clock, Home } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function ChildLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    const navItems = [
        { href: route('child.home'), label: 'Home', icon: Home },
        { href: route('child.training.index'), label: 'Lernen', icon: BookOpen },
        { href: route('child.media-time.index'), label: 'Medienzeit', icon: Clock },
        { href: route('child.statistics'), label: 'Fortschritt', icon: BarChart2 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Top navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">VokabelFuchs</span>
                    <nav className="flex gap-1">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    url === href.replace(window.location.origin, '')
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <Link
                        href={route('child.logout')}
                        method="post"
                        as="button"
                        className="text-xs text-gray-500 hover:text-gray-800"
                    >
                        Abmelden
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
