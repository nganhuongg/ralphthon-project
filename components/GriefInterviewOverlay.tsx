'use client';

// components/GriefInterviewOverlay.tsx
// Full-screen grief interview overlay — non-dismissible 3-question ceremony.
// Triggered by setActiveInterview(pathId) from PathColumn abandon button.
// On completion: calls abandonPath → addGriefEntry → clearInterview in that order.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVerseStore } from '@/lib/store';
import { nanoid } from 'nanoid';
import type { GriefEntry } from '@/lib/tuvi/types';

const QUESTIONS = [
  "What are you letting go of?",
  "What does that cost you?",
  "What do you now know?",
] as const;

export default function GriefInterviewOverlay() {
  const activeInterview = useVerseStore((s) => s.activeInterview);
  const paths = useVerseStore((s) => s.paths);
  const advanceInterview = useVerseStore((s) => s.advanceInterview);
  const abandonPath = useVerseStore((s) => s.abandonPath);
  const addGriefEntry = useVerseStore((s) => s.addGriefEntry);
  const clearInterview = useVerseStore((s) => s.clearInterview);

  const [answer, setAnswer] = useState('');

  // Reset textarea when question advances
  useEffect(() => {
    setAnswer('');
  }, [activeInterview.questionIndex]);

  // No active interview — render nothing
  if (!activeInterview.pathId) return null;

  // Defensive guard: questionIndex should never exceed 2 during normal flow
  if (activeInterview.questionIndex > 2) return null;

  const pathId = activeInterview.pathId;
  const pathState = paths[pathId];
  const currentDepth = pathState?.nodes.length ?? 0;
  const pathSummary = pathState?.nodes[0]?.content ?? '';

  function handleSubmit() {
    const trimmed = answer.trim();
    if (!trimmed) return;

    const qi = activeInterview.questionIndex;

    if (qi < 2) {
      advanceInterview(trimmed);
    } else {
      // Final answer — collect all answers and run completion sequence
      const allAnswers = [...activeInterview.answers, trimmed];
      const entry: GriefEntry = {
        id: nanoid(),
        pathId,
        abandonedAt: Date.now(),
        abandonedAtDepth: currentDepth,
        answers: {
          lettingGo: allAnswers[0] ?? '',
          cost: allAnswers[1] ?? '',
          nowKnow: allAnswers[2] ?? '',
        },
        pathSummary,
      };
      abandonPath(pathId, currentDepth, pathSummary);
      addGriefEntry(entry);
      clearInterview();
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="grief-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      >
        <div className="bg-verse-red/90 border border-verse-gold/30 p-8 max-w-md w-full mx-4">
          <p className="text-xs text-verse-gold/60 tracking-[0.3em] uppercase mb-6">
            Question {activeInterview.questionIndex + 1} of 3
          </p>
          <p className="text-verse-paper text-lg leading-relaxed mb-6">
            {QUESTIONS[activeInterview.questionIndex]}
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full bg-black/20 border border-verse-gold/20 text-verse-paper/90 p-3 text-sm leading-relaxed resize-none focus:outline-none focus:border-verse-gold/50 placeholder:text-verse-paper/30"
            placeholder="Write freely..."
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="mt-4 w-full text-xs tracking-widest uppercase border border-verse-gold/40 hover:border-verse-gold text-verse-gold/70 hover:text-verse-gold py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {activeInterview.questionIndex < 2 ? 'Continue' : 'Release this path'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
