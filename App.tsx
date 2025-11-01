
import React, { useState, useCallback } from 'react';
import { GeneratedPrompt } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { generateVideoPrompt } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DurationSelector from './components/DurationSelector';
import PromptCard from './components/PromptCard';
import { SparklesIcon, MusicNoteIcon, PhotographIcon, ClockIcon } from './components/icons';

const App: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setimageFile] = useState<File | null>(null);
    const [lyrics, setLyrics] = useState<string>('');
    const [segmentDuration, setSegmentDuration] = useState<number>(10);
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isGenerationDisabled = !audioFile || !imageFile || !lyrics || isLoading;

    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContext.decodeAudioData(event.target?.result as ArrayBuffer, 
                    (buffer) => resolve(buffer.duration),
                    (err) => reject(`Error decoding audio file: ${err}`)
                );
            };
            reader.onerror = () => reject('Error reading audio file.');
            reader.readAsArrayBuffer(file);
        });
    };

    const handleGenerate = useCallback(async () => {
        if (isGenerationDisabled) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPrompts([]);

        try {
            const audioDuration = await getAudioDuration(audioFile!);
            const imageBase64 = await fileToBase64(imageFile!);
            const imageMimeType = imageFile!.type;

            const numSegments = Math.ceil(audioDuration / segmentDuration);
            const lyricLines = lyrics.split('\n').filter(line => line.trim() !== '');
            const totalLines = lyricLines.length;
            const linesPerSegment = Math.max(1, Math.floor(totalLines / numSegments));

            const promptPromises: Promise<string>[] = [];
            const promptMetadata: { startTime: number; endTime: number }[] = [];

            for (let i = 0; i < numSegments; i++) {
                const startTime = i * segmentDuration;
                const endTime = Math.min((i + 1) * segmentDuration, audioDuration);

                const isLastSegment = i === numSegments - 1;
                const remainingTime = audioDuration - startTime;
                const isOutro = isLastSegment && remainingTime < segmentDuration / 2 && remainingTime > 0;
                
                const startLine = i * linesPerSegment;
                const endLine = (i + 1) * linesPerSegment;
                const lyricsChunk = lyricLines.slice(startLine, endLine).join('\n');

                promptMetadata.push({ startTime, endTime });
                promptPromises.push(
                    generateVideoPrompt(
                        imageBase64,
                        imageMimeType,
                        lyricsChunk,
                        segmentDuration,
                        isOutro
                    )
                );
            }

            const resolvedPrompts = await Promise.all(promptPromises);

            const finalPrompts = resolvedPrompts.map((prompt, index) => ({
                ...promptMetadata[index],
                prompt,
            }));

            setGeneratedPrompts(finalPrompts);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [audioFile, imageFile, lyrics, segmentDuration, isGenerationDisabled]);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <main className="container mx-auto px-4 py-8 md:py-16">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
                        AI Music Video Prompt Generator
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Turn your song into a visually stunning music video concept. Upload your track, character, and lyrics to generate scene-by-scene video prompts.
                    </p>
                </header>

                <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 flex items-center"><MusicNoteIcon /> Step 1: Upload Your Song & Lyrics</h2>
                                <FileUpload
                                    onFileSelect={setAudioFile}
                                    accept="audio/*"
                                    label="Select Audio File"
                                />
                                <textarea
                                    className="mt-4 w-full h-40 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                    placeholder="Paste song lyrics here. This helps the AI understand the song's narrative and mood..."
                                    value={lyrics}
                                    onChange={(e) => setLyrics(e.target.value)}
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-3 flex items-center"><PhotographIcon /> Step 2: Upload Character Image</h2>
                                <FileUpload
                                    onFileSelect={setimageFile}
                                    accept="image/*"
                                    label="Select Character Image"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 flex items-center"><ClockIcon /> Step 3: Select Segment Duration</h2>
                                <DurationSelector
                                    selectedDuration={segmentDuration}
                                    onSelectDuration={setSegmentDuration}
                                />
                            </div>
                            
                            <div className="mt-8">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerationDisabled}
                                    className="w-full text-lg font-bold py-4 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                >
                                    <SparklesIcon />
                                    {isLoading ? 'Generating...' : 'Generate Prompts'}
                                </button>
                                {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                     <div className="text-center mt-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                        <p className="mt-4 text-gray-400">AI is crafting your video scenes... this may take a moment.</p>
                    </div>
                )}
                
                {generatedPrompts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Generated Prompts</h2>
                        <div className="space-y-6">
                            {generatedPrompts.map((p, index) => (
                                <PromptCard key={index} prompt={p} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
