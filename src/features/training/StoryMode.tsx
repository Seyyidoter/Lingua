import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Shuffle } from "lucide-react";
import { generateStory } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
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
            <div className="text-xl leading-8 text-foreground/90 font-medium">
                {parts.map((part, i) => {
                    const isBold = part.startsWith("**") && part.endsWith("**");
                    const text = isBold ? part.slice(2, -2) : part;

                    return (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={isBold ? "text-primary bg-primary/10 px-1.5 py-0.5 rounded-md mx-0.5 border border-primary/20" : ""}
                        >
                            {text}
                        </motion.span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-foreground">
                    <BookOpen className="w-8 h-8 text-primary" />
                    Story of the Day
                </h2>
                <p className="text-muted-foreground text-lg">
                    Generate a unique short story using random words from your current list.
                </p>

                <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={loading || data.length === 0}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all px-8 py-6 text-lg rounded-xl"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Writing...
                        </>
                    ) : (
                        <>
                            <Shuffle className="w-5 h-5 mr-3" />
                            Generate New Story
                        </>
                    )}
                </Button>
            </motion.div>

            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border"
                >
                    <p className="animate-pulse">Linguini is thinking about a creative plot...</p>
                </motion.div>
            )}

            {!loading && story && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glass border-none overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-primary">Target Vocabulary</CardTitle>
                            <CardDescription className="flex flex-wrap gap-2 pt-2">
                                {targetWords.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Badge variant="outline" className="text-sm py-1 px-3 border-primary/20 bg-background/50 text-foreground">
                                            {item.src} ({item.dst})
                                        </Badge>
                                    </motion.div>
                                ))}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-8">
                            <div>
                                {renderStory()}
                            </div>

                            {translation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="pt-6 border-t border-border"
                                >
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <span className="w-6 h-px bg-border"></span>
                                        TRANSLATION
                                        <span className="flex-1 h-px bg-border"></span>
                                    </h4>
                                    <p className="text-foreground/80 italic leading-relaxed text-lg">{translation}</p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
