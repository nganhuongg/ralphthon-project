'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVerseStore } from '@/lib/store';
import type { GriefEntry } from '@/lib/tuvi/types';

// ── Label maps ────────────────────────────────────────────────────────────────

const PATH_LABELS: Record<string, string> = {
  duty: 'Duty',
  desire: 'Desire',
  transformation: 'Transformation',
};

const ANSWER_LABELS = [
  'What are you letting go of?',
  'What does that cost you?',
  'What do you now know?',
] as const;

// ── GriefEntryCard ────────────────────────────────────────────────────────────

function GriefEntryCard({ entry }: { entry: GriefEntry }) {
  const label = PATH_LABELS[entry.pathId] ?? entry.pathId;
  const answerValues = [
    entry.answers.lettingGo,
    entry.answers.cost,
    entry.answers.nowKnow,
  ];

  return (
    <div className="border-l border-verse-gold/20 pl-3">
      <p className="text-xs text-verse-gold/50 tracking-widest uppercase mb-1">
        {label}
      </p>
      {entry.pathSummary && (
        <p className="text-xs text-verse-paper/50 italic leading-relaxed mb-3 line-clamp-2">
          {entry.pathSummary}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {ANSWER_LABELS.map((question, i) => (
          <div key={question}>
            <p className="text-[10px] text-verse-gold/40 tracking-wider uppercase mb-1">
              {question}
            </p>
            <p className="text-xs text-verse-paper/70 leading-relaxed">
              {answerValues[i] ?? ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GriefArchiveSidebar ───────────────────────────────────────────────────────

export default function GriefArchiveSidebar() {
  const griefEntries = useVerseStore((s) => s.griefEntries);
  const [isOpen, setIsOpen] = useState(griefEntries.length > 0);

  return (
    <div className="relative flex">
      {/* Toggle tab — always visible */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="absolute -left-6 top-4 text-verse-gold/40 hover:text-verse-gold/70 text-xs tracking-widest uppercase transition-colors"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        aria-label={isOpen ? 'Close archive' : 'Open archive'}
      >
        Archive
      </button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="archive-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-64 border-l border-verse-gold/20 pl-6 overflow-y-auto max-h-screen"
          >
            <h2 className="text-xs font-light tracking-[0.4em] uppercase text-verse-gold/70 mb-6">
              Paths Released
            </h2>

            {griefEntries.length === 0 ? (
              <p className="text-xs text-verse-paper/30 leading-relaxed">
                No paths have been released yet.
              </p>
            ) : (
              <div className="flex flex-col gap-8">
                {griefEntries.map((entry) => (
                  <GriefEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
