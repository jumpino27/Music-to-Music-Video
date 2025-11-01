
import React, { useState } from 'react';
import { GeneratedPrompt } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

interface PromptCardProps {
    prompt: GeneratedPrompt;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg border border-gray-700 relative backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-lg text-purple-400">
                    {formatTime(prompt.startTime)} - {formatTime(prompt.endTime)}
                </h3>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-gray-300"
                    aria-label="Copy prompt"
                >
                    {copied ? <CheckIcon /> : <ClipboardIcon />}
                </button>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{prompt.prompt}</p>
        </div>
    );
};

export default PromptCard;
