import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import ChildLayout from '@/components/layout/ChildLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { TrainingQuestion, TrainingSession } from '@/types/models';

interface LastResult {
    correct: boolean;
    correct_answer: string;
    given_answer: string;
}

interface Props {
    session: TrainingSession;
    question: TrainingQuestion;
    cards_remaining: number;
    cards_total: number;
    last_result?: LastResult | null;
    media_per_answer?: { gaming: number; youtube: number } | null;
}

export default function TrainingSession({ session, question, cards_remaining, cards_total, last_result, media_per_answer }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState<LastResult | null>(null);

    const prevCardIdRef = useRef<number | null>(null);

    // When a new question arrives after answering, show the result of the previous answer
    useEffect(() => {
        if (prevCardIdRef.current !== null && prevCardIdRef.current !== question.flash_card_id && last_result) {
            setFeedback(last_result);
        }
        prevCardIdRef.current = question.flash_card_id;
    }, [question.flash_card_id]);

    const progress = cards_total > 0
        ? ((cards_total - cards_remaining) / cards_total) * 100
        : 0;

    const submitAnswer = (submittedAnswer: string) => {
        if (processing) return;
        setProcessing(true);
        router.post(route('child.training.answer', session.id), {
            flash_card_id: question.flash_card_id,
            answer: submittedAnswer,
            mode: question.mode,
            target_lang: question.target_lang,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAnswer(null);
                setTextAnswer('');
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleMultipleChoiceSelect = (option: string) => {
        setSelectedAnswer(option);
    };

    const handleFreeTextSubmit = () => {
        if (textAnswer.trim()) {
            submitAnswer(textAnswer);
        }
    };

    // Feedback overlay (shown after each answer)
    if (feedback) {
        return (
            <ChildLayout>
                <Head title="Training" />
                <div className="space-y-6">
                    {/* Progress bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>✓ {session.cards_correct} · ✗ {session.cards_wrong}</span>
                            <span>{cards_remaining} übrig</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Feedback card */}
                    <div className={`rounded-2xl border-2 shadow-sm p-8 text-center space-y-4 ${
                        feedback.correct
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                    }`}>
                        <div className="text-7xl">
                            {feedback.correct ? '🎉' : '😕'}
                        </div>
                        <h2 className={`text-2xl font-bold ${feedback.correct ? 'text-green-700' : 'text-red-700'}`}>
                            {feedback.correct ? 'Super gemacht!' : 'Leider falsch'}
                        </h2>
                        {!feedback.correct && (
                            <div className="space-y-2">
                                {feedback.given_answer && (
                                    <p className="text-sm text-red-500">
                                        Deine Antwort: <span className="font-semibold">{feedback.given_answer}</span>
                                    </p>
                                )}
                                <div className="bg-white rounded-xl border border-green-200 px-4 py-3">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Richtige Antwort</p>
                                    <p className="text-xl font-bold text-green-700">{feedback.correct_answer}</p>
                                </div>
                            </div>
                        )}
                        {feedback.correct && (
                            <p className="text-green-600 font-medium">{feedback.correct_answer}</p>
                        )}
                        {feedback.correct && media_per_answer && (
                            <div className="flex gap-2 justify-center text-sm font-medium">
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">🎮 +{media_per_answer.gaming} min</span>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">📺 +{media_per_answer.youtube} min</span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="button"
                        size="lg"
                        className={`w-full h-14 text-base font-semibold ${
                            feedback.correct
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        onClick={() => setFeedback(null)}
                    >
                        Weiter →
                    </Button>
                </div>
            </ChildLayout>
        );
    }

    return (
        <ChildLayout>
            <Head title="Training" />

            <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>✓ {session.cards_correct} · ✗ {session.cards_wrong}</span>
                        <span>{cards_remaining} übrig</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Question card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                            {question.source_lang.toUpperCase()} → {question.target_lang.toUpperCase()}
                            {' · '}Fach {question.drawer}
                        </p>

                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{question.prompt}</h2>
                            <TtsButton
                                text={question.prompt}
                                lang={question.source_lang as 'de' | 'en' | 'fr'}
                            />
                        </div>

                        {question.sentence && (
                            <p className="text-sm text-gray-500 italic">„{question.sentence}"</p>
                        )}
                    </div>

                    {/* Multiple choice */}
                    {question.mode === 'multiple_choice' && question.options && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleMultipleChoiceSelect(option)}
                                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                                        selectedAnswer === option
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Free text */}
                    {question.mode === 'free_text' && (
                        <div className="space-y-3 mt-4">
                            <Input
                                type="text"
                                placeholder="Übersetzung eingeben..."
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !processing && textAnswer.trim() && handleFreeTextSubmit()}
                                className="text-center text-lg h-12"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Submit button */}
                {question.mode === 'multiple_choice' ? (
                    <Button
                        type="button"
                        size="lg"
                        className="w-full h-12"
                        disabled={!selectedAnswer || processing}
                        onClick={() => submitAnswer(selectedAnswer!)}
                    >
                        Antworten →
                    </Button>
                ) : (
                    <Button
                        type="button"
                        size="lg"
                        className="w-full h-12"
                        disabled={!textAnswer.trim() || processing}
                        onClick={handleFreeTextSubmit}
                    >
                        Prüfen →
                    </Button>
                )}

                {/* Skip + Finish */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        type="button"
                        disabled={processing}
                        className="text-sm text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
                        onClick={() => {
                            if (processing) return;
                            setProcessing(true);
                            router.post(route('child.training.skip', session.id), {
                                flash_card_id: question.flash_card_id,
                            }, { onFinish: () => setProcessing(false) });
                        }}
                    >
                        Überspringen
                    </button>
                    <button
                        type="button"
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                        onClick={() => router.post(route('child.training.finish', session.id))}
                    >
                        Training beenden
                    </button>
                </div>
            </div>
        </ChildLayout>
    );
}
