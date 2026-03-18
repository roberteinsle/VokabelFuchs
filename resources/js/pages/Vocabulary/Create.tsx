import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import TtsButton from '@/components/common/TtsButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from '@/types/models';

interface Props {
    tags: Tag[];
}

export default function VocabularyCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        word_de: '',
        word_en: '',
        word_fr: '',
        sentence_de: '',
        sentence_en: '',
        sentence_fr: '',
        tag_ids: [] as number[],
    });

    const toggleTag = (tagId: number) => {
        setData('tag_ids', data.tag_ids.includes(tagId)
            ? data.tag_ids.filter((id) => id !== tagId)
            : [...data.tag_ids, tagId]);
    };

    return (
        <AppLayout>
            <Head title="Vokabel anlegen" />

            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold">Neue Vokabel</h1>

                <form onSubmit={(e) => { e.preventDefault(); post(route('parent.vocabulary.store')); }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Wörter</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* German */}
                            <div className="space-y-1">
                                <Label>Deutsch *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={data.word_de}
                                        onChange={(e) => setData('word_de', e.target.value)}
                                        placeholder="z.B. der Hund"
                                        required
                                    />
                                    {data.word_de && <TtsButton text={data.word_de} lang="de" />}
                                </div>
                                {errors.word_de && <p className="text-sm text-red-600">{errors.word_de}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Beispielsatz Deutsch</Label>
                                <Input
                                    value={data.sentence_de}
                                    onChange={(e) => setData('sentence_de', e.target.value)}
                                    placeholder="z.B. Der Hund spielt im Garten."
                                />
                            </div>

                            {/* English */}
                            <div className="space-y-1">
                                <Label>Englisch</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={data.word_en}
                                        onChange={(e) => setData('word_en', e.target.value)}
                                        placeholder="z.B. the dog"
                                    />
                                    {data.word_en && <TtsButton text={data.word_en} lang="en" />}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Beispielsatz Englisch</Label>
                                <Input
                                    value={data.sentence_en}
                                    onChange={(e) => setData('sentence_en', e.target.value)}
                                    placeholder="z.B. The dog plays in the garden."
                                />
                            </div>

                            {/* French */}
                            <div className="space-y-1">
                                <Label>Französisch</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={data.word_fr}
                                        onChange={(e) => setData('word_fr', e.target.value)}
                                        placeholder="z.B. le chien"
                                    />
                                    {data.word_fr && <TtsButton text={data.word_fr} lang="fr" />}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Beispielsatz Französisch</Label>
                                <Input
                                    value={data.sentence_fr}
                                    onChange={(e) => setData('sentence_fr', e.target.value)}
                                    placeholder="z.B. Le chien joue dans le jardin."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {tags.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
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
                        <Button type="button" variant="outline" onClick={() => history.back()}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={processing || !data.word_de}>
                            Vokabel speichern
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
