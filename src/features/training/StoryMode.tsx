import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Shuffle } from "lucide-react";
import { generateStory } from "@/app/actions";
import type { Item, DatasetKey } from "@/lib/types";

interface StoryModeProps {
    data: Item[];
    datasetKey: DatasetKey; // "en_tr" or "tr_ru"
}

export default function StoryMode({ data, datasetKey }: StoryModeProps) {
    const [targetWords, setTargetWords] = useState<Item[]>([]);
    const [story, setStory] = useState<string | null>(null);
    const [translation, setTranslation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Helper to get language names
    const getLangNames = () => {
        if (datasetKey === "en_tr") return { src: "English", dst: "Turkish" };
        if (datasetKey === "tr_ru") return { src: "Turkish", dst: "Russian" };
        return { src: "Source", dst: "Target" };
    };

    const handleGenerate = async () => {
        if (data.length < 5) {
            alert("Not enough words to generate a story! Please choose a 'All' level or a larger set.");
            return;
        }

        setLoading(true);
        setStory(null);
        setTranslation(null);

        // 1. Pick 5 random words
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setTargetWords(selected);

        // 2. Prepare args
        const wordList = selected.map((item) => item.src);
        const { src, dst } = getLangNames();

        // Level is tricky because items might have mixed levels if "ALL" is selected.
        // Let's grab the level of the first item or default to B1.
        const level = selected[0].level || "B1";

        // 3. Call AI
        const result = await generateStory(wordList, src, dst, level);

        if (result) {
            setStory(result.story);
            setTranslation(result.translation);
        } else {
            setStory("Failed to generate story. Please try again.");
        }

        setLoading(false);
    };

    // Function to render story with highlighted words
    const renderStory = () => {
        if (!story) return null;

        // React-safe way to parse **text** to bold
        // We split by **
        const parts = story.split(/(\*\*.*?\*\*)/g);

        return (
            <div className="text-lg leading-relaxed text-gray-800">
                {parts.map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                            <span key={i} className="font-bold text-emerald-600 bg-emerald-100 px-1 rounded mx-0.5">
                                {part.slice(2, -2)}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-indigo-500" />
                    Story of the Day
                </h2>
                <p className="text-muted-foreground">
                    Generate a unique short story using random words from your current list.
                </p>

                <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={loading || data.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Writing...
                        </>
                    ) : (
                        <>
                            <Shuffle className="w-5 h-5 mr-2" />
                            Generate New Story
                        </>
                    )}
                </Button>
            </div>

            {loading && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Linguini is thinking about a creative plot...</p>
                </div>
            )}

            {!loading && story && (
                <Card className="border-2 border-indigo-100 shadow-xl bg-white/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Target Vocabulary</CardTitle>
                        <CardDescription className="flex flex-wrap gap-2 pt-2">
                            {targetWords.map((item) => (
                                <Badge key={item.id} variant="outline" className="text-sm py-1 px-3 border-emerald-200 bg-emerald-50 text-emerald-800">
                                    {item.src} ({item.dst})
                                </Badge>
                            ))}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 shadow-inner">
                            {renderStory()}
                        </div>

                        {translation && (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Translation</h4>
                                <p className="text-gray-600 italic leading-relaxed">{translation}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
