import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ChildLayout from '@/components/layout/ChildLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { TrainingQuestion, TrainingSession } from '@/types/models';
import { isAcceptable } from '@/lib/levenshtein';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
    session: TrainingSession;
    question: TrainingQuestion;
    cards_remaining: number;
    cards_total: number;
}

export default function TrainingSession({ session, question, cards_remaining, cards_total }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrectPreview, setIsCorrectPreview] = useState(false);

    const { data, setData, post, processing } = useForm({
        flash_card_id: question.flash_card_id,
        answer: '',
        mode: question.mode,
        target_lang: question.target_lang,
    });

    const progress = cards_total > 0
        ? ((cards_total - cards_remaining) / cards_total) * 100
        : 0;

    const handleMultipleChoiceSelect = (option: string) => {
        setSelectedAnswer(option);
        setData('answer', option);
    };

    const handleFreeTextSubmit = () => {
        setData('answer', textAnswer);
        submitAnswer(textAnswer);
    };

    const submitAnswer = (answer: string) => {
        post(route('child.training.answer', session.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAnswer(null);
                setTextAnswer('');
                setShowFeedback(false);
            },
        });
    };

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
                                onKeyDown={(e) => e.key === 'Enter' && textAnswer.trim() && handleFreeTextSubmit()}
                                className="text-center text-lg h-12"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <form onSubmit={(e) => { e.preventDefault(); }}>
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
                </form>

                {/* Finish session */}
                <div className="text-center">
                    <form onSubmit={(e) => { e.preventDefault(); post(route('child.training.finish', session.id)); }}>
                        <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 underline">
                            Training beenden
                        </button>
                    </form>
                </div>
            </div>
        </ChildLayout>
    );
}
