const LANG_MAP: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    fr: 'fr-FR',
};

export function speak(text: string, lang: 'de' | 'en' | 'fr'): void {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] ?? 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

export function isTtsSupported(): boolean {
    return 'speechSynthesis' in window;
}
