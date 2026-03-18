import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock, Star, Users } from 'lucide-react';

export default function Landing() {
    return (
        <>
            <Head title="VokabelFuchs – Vokabeln lernen mit Spaß" />

            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🦊</span>
                        <span className="text-xl font-bold text-gray-900">VokabelFuchs</span>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('login')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Anmelden
                        </Link>
                        <Link
                            href={route('register')}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Kostenlos starten
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <section className="text-center py-20 px-6 max-w-3xl mx-auto">
                    <div className="text-6xl mb-6">🦊</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Vokabeln lernen,<br />Medienzeit verdienen
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                        VokabelFuchs motiviert Kinder beim Sprachenlernen mit einem cleveren
                        Belohnungssystem: Gelernte Vokabeln werden in Gaming- und YouTube-Zeit umgewandelt.
                    </p>
                    <Link
                        href={route('register')}
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-lg"
                    >
                        Jetzt kostenlos registrieren →
                    </Link>
                </section>

                {/* Features */}
                <section className="py-16 px-6 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Leitner-System</h3>
                            <p className="text-sm text-gray-500">5-Fächer-Karteikasten mit intelligentem Wiederholungsalgorithmus</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                            <Clock className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Medienzeit</h3>
                            <p className="text-sm text-gray-500">Lernzeit wird automatisch in Gaming- & YouTube-Minuten umgewandelt</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                            <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Mehrere Kinder</h3>
                            <p className="text-sm text-gray-500">Profile für alle Kinder, jedes PIN-geschützt und individuell konfigurierbar</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Deutsch · Englisch · Französisch</h3>
                            <p className="text-sm text-gray-500">Vokabeln mit Text-to-Speech zum Anhören und Freitext-Eingabe</p>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16 px-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-10">So funktioniert's</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '1', title: 'Elternteil registriert sich', desc: 'Vokabeln anlegen, Kinder hinzufügen, Medienzeit-Regeln festlegen' },
                                { step: '2', title: 'Kind wählt sein Profil', desc: 'PIN eingeben, Karteikarten lernen — Multiple Choice oder Freitext' },
                                { step: '3', title: 'Medienzeit einlösen', desc: 'Verdiente Gaming- und YouTube-Minuten im Dashboard anzeigen lassen' },
                            ].map(({ step, title, desc }) => (
                                <div key={step} className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                                        {step}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                                    <p className="text-sm text-gray-500">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Bereit loszulegen?</h2>
                    <p className="text-gray-600 mb-6">Kostenlos — keine Kreditkarte erforderlich.</p>
                    <Link
                        href={route('register')}
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                    >
                        Account erstellen →
                    </Link>
                </section>

                <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
                    VokabelFuchs · Vokabeln lernen mit Spaß
                </footer>
            </div>
        </>
    );
}
