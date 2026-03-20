import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Vocabulary } from '@/types/models';
import { useState } from 'react';
import axios from 'axios';

interface VocabularyListData {
    id: number;
    name: string;
    language_pair: string;
}

interface Props {
    vocabulary: Vocabulary;
    list: VocabularyListData | null;
    tags: Tag[];
}

const LANG_LABELS: Record<string, string> = { de_en: 'Englisch', de_fr: 'Französisch' };
const TARGET_LANG: Record<string, 'en' | 'fr'> = { de_en: 'en', de_fr: 'fr' };

export default function VocabularyEdit({ vocabulary, list, tags }: Props) {
    const targetLang = list ? (TARGET_LANG[list.language_pair] ?? 'en') : null;
    const targetLabel = list ? (LANG_LABELS[list.language_pair] ?? list.language_pair) : null;
    const { data, setData, put, processing, errors } = useForm({
        word_de: vocabulary.word_de,
        word_en: vocabulary.word_en ?? '',
        word_fr: vocabulary.word_fr ?? '',
        sentence_de: vocabulary.sentence_de ?? '',
        sentence_en: vocabulary.sentence_en ?? '',
        sentence_fr: vocabulary.sentence_fr ?? '',
        tag_ids: vocabulary.tags.map((t) => t.id),
    });

    const [imagePath, setImagePath] = useState<string | null>(vocabulary.image_path ?? null);
    const [generating, setGenerating] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleGenerateImage = async () => {
        setGenerating(true);
        setImageError(null);
        try {
            const response = await axios.post(route('parent.vocabulary.generate-image', vocabulary.id));
            setImagePath(response.data.image_path);
        } catch (err: any) {
            setImageError(err.response?.data?.error ?? 'Fehler bei der Bildgenerierung');
        } finally {
            setGenerating(false);
        }
    };

    const toggleTag = (tagId: number) => {
        setData('tag_ids', data.tag_ids.includes(tagId)
            ? data.tag_ids.filter((id) => id !== tagId)
            : [...data.tag_ids, tagId]);
    };

    return (
        <AppLayout>
            <Head title="Vokabel bearbeiten" />

            <div className="max-w-2xl space-y-6">
                <div>
                    {list && <p className="text-sm text-gray-500">{list.name}</p>}
                    <h1 className="text-2xl font-bold">Vokabel bearbeiten</h1>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); put(route('parent.vocabulary.update', vocabulary.id)); }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Wörter</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Deutsch *</Label>
                                <div className="flex gap-2">
                                    <Input value={data.word_de} onChange={(e) => setData('word_de', e.target.value)} required />
                                    {data.word_de && <TtsButton text={data.word_de} lang="de" />}
                                </div>
                                {errors.word_de && <p className="text-sm text-red-600">{errors.word_de}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Beispielsatz Deutsch</Label>
                                <Input value={data.sentence_de} onChange={(e) => setData('sentence_de', e.target.value)} />
                            </div>
                            {(targetLang === 'en' || !list) && (
                                <>
                                    <div className="space-y-1">
                                        <Label>{targetLang === 'en' ? targetLabel : 'Englisch'}</Label>
                                        <div className="flex gap-2">
                                            <Input value={data.word_en} onChange={(e) => setData('word_en', e.target.value)} />
                                            {data.word_en && <TtsButton text={data.word_en} lang="en" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Beispielsatz {targetLang === 'en' ? targetLabel : 'Englisch'}</Label>
                                        <Input value={data.sentence_en} onChange={(e) => setData('sentence_en', e.target.value)} />
                                    </div>
                                </>
                            )}
                            {(targetLang === 'fr' || !list) && (
                                <>
                                    <div className="space-y-1">
                                        <Label>{targetLang === 'fr' ? targetLabel : 'Französisch'}</Label>
                                        <div className="flex gap-2">
                                            <Input value={data.word_fr} onChange={(e) => setData('word_fr', e.target.value)} />
                                            {data.word_fr && <TtsButton text={data.word_fr} lang="fr" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Beispielsatz {targetLang === 'fr' ? targetLabel : 'Französisch'}</Label>
                                        <Input value={data.sentence_fr} onChange={(e) => setData('sentence_fr', e.target.value)} />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Image generation */}
                    <Card>
                        <CardHeader><CardTitle>Bild</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {imagePath && (
                                <div className="flex justify-center">
                                    <img
                                        src={imagePath}
                                        alt={data.word_de}
                                        className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                                    />
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGenerateImage}
                                disabled={generating || !data.word_de}
                                className="w-full"
                            >
                                {generating ? 'Wird generiert...' : imagePath ? 'Bild neu generieren' : 'Bild generieren'}
                            </Button>
                            {imageError && <p className="text-sm text-red-600">{imageError}</p>}
                            <p className="text-xs text-gray-500">Nutzt den Google Cloud API-Key aus den Profil-Einstellungen (Imagen API).</p>
                        </CardContent>
                    </Card>

                    {tags.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                                data.tag_ids.includes(tag.id)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => history.back()}>Abbrechen</Button>
                        <Button type="submit" disabled={processing}>Speichern</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
