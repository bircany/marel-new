'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface UploadedFile {
    id?: number;
    file?: File;
    preview: string;
    url?: string;
}

interface ImageUploadProps {
    value: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
    max?: number;
    label?: string;
}

export default function ImageUpload({ value, onChange, max = 8, label = 'Görseller' }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const addFiles = useCallback((fileList: FileList) => {
        const remaining = max - value.length;
        const newFiles = Array.from(fileList).slice(0, remaining).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        onChange([...value, ...newFiles]);
    }, [value, max, onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleRemove = (idx: number) => {
        const updated = [...value];
        const removed = updated.splice(idx, 1)[0];
        if (removed.preview && !removed.url) URL.revokeObjectURL(removed.preview);
        onChange(updated);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>

            {/* Drag & Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${dragging
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    }
          ${value.length >= max ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
                <svg className="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-400">
                    Görselleri sürükleyin veya <span className="text-indigo-400">seçin</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">{value.length}/{max} görsel</p>
            </div>

            {/* Öngösterimler */}
            {value.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                    {value.map((file, idx) => (
                        <div key={file.preview} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-slate-700">
                            <Image
                                src={file.url ?? file.preview}
                                alt={`Görsel ${idx + 1}`}
                                fill sizes="80px"
                                className="object-cover"
                            />
                            {idx === 0 && (
                                <span className="absolute top-1 left-1 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">
                                    Kapak
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
