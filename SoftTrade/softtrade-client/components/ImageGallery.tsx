'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types';

interface ImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [activeIdx, setActiveIdx] = useState(0);

    if (!images.length) {
        return (
            <div className="aspect-square rounded-2xl bg-slate-800/60 border border-slate-700/50
                      flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    const active = images[activeIdx];

    return (
        <div className="flex flex-col gap-3">
            {/* Ana Görsel */}
            <div className="relative aspect-square rounded-2xl bg-slate-800/60 border border-slate-700/50
                      overflow-hidden group">
                <Image
                    src={active.url}
                    alt={`${productName} — görsel ${activeIdx + 1}`}
                    fill
                    priority
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gezinme okları */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveIdx((p) => (p === 0 ? images.length - 1 : p - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                         bg-slate-900/70 backdrop-blur-sm border border-slate-700/50
                         flex items-center justify-center text-slate-300 hover:text-white
                         opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Önceki görsel"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setActiveIdx((p) => (p === images.length - 1 ? 0 : p + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                         bg-slate-900/70 backdrop-blur-sm border border-slate-700/50
                         flex items-center justify-center text-slate-300 hover:text-white
                         opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Sonraki görsel"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Fotoğraf sayısı */}
                <span className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-sm
                         text-xs text-slate-300 px-2 py-1 rounded-lg border border-slate-700/50">
                    {activeIdx + 1} / {images.length}
                </span>
            </div>

            {/* Thumbnaillar */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setActiveIdx(idx)}
                            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0
                          border-2 transition-all duration-200
                          ${idx === activeIdx
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                    : 'border-slate-700/50 hover:border-slate-500 opacity-60 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img.url}
                                alt={`${productName} — thumbnail ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
