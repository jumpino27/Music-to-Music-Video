
import React from 'react';

interface DurationSelectorProps {
    selectedDuration: number;
    onSelectDuration: (duration: number) => void;
}

const DURATIONS = [5, 10, 15, 20, 25];

const DurationSelector: React.FC<DurationSelectorProps> = ({ selectedDuration, onSelectDuration }) => {
    return (
        <div className="flex flex-wrap gap-3">
            {DURATIONS.map((duration) => (
                <button
                    key={duration}
                    onClick={() => onSelectDuration(duration)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                        ${selectedDuration === duration
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    {duration} seconds
                </button>
            ))}
        </div>
    );
};

export default DurationSelector;
