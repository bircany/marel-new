'use client';

import { useState } from 'react';

interface TabsProps {
    tabs: { label: string; content: React.ReactNode }[];
}

export default function Tabs({ tabs }: TabsProps) {
    const [active, setActive] = useState(0);

    return (
        <div>
            {/* Tab Başlıkları */}
            <div className="flex gap-1 border-b border-slate-700/50 mb-6">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.label}
                        onClick={() => setActive(idx)}
                        className={`px-5 py-3 text-sm font-medium transition-all relative
              ${idx === active
                                ? 'text-indigo-400'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                        {idx === active && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* İçerik */}
            <div className="animate-fade-in">
                {tabs[active].content}
            </div>
        </div>
    );
}
