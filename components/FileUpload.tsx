
import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    accept: string;
    label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        } else {
            setFileName(null);
            onFileSelect(null);
            setPreviewUrl(null);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />
            <div
                onClick={handleClick}
                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700/50 transition"
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md mb-2" />
                ) : (
                    <UploadIcon className="mx-auto" />
                )}
                <p className="text-gray-400 mt-2 text-sm">
                    {fileName || label}
                </p>
            </div>
        </div>
    );
};

export default FileUpload;
