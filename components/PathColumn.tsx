// components/PathColumn.tsx
// Single path column — renders nodes, depth dots, expand and abandon buttons.
// Reads from Zustand store via pathId; receives streaming state from parent.

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useVerseStore } from '@/lib/store';
import type { PathId } from '@/lib/tuvi/types';

interface PathColumnProps {
  pathId: PathId;
  label: 'Duty' | 'Desire' | 'Transformation';
  streamingContent?: string;   // live text from useCompletion.completion
  isStreaming: boolean;        // from useCompletion.isLoading
  onExpand: () => void;        // called when user clicks Expand / Go deeper
}

const MAX_DEPTH = 5;

export default function PathColumn({
  pathId,
  label,
  streamingContent,
  isStreaming,
  onExpand,
}: PathColumnProps) {
  const pathState = useVerseStore((s) => s.paths[pathId]);
  const setActiveInterview = useVerseStore((s) => s.setActiveInterview);

  // Guard: store may not have initialised yet
  if (!pathState) return null;

  const currentDepth = pathState.nodes.length;

  return (
    <div className={`flex flex-col ${pathState.isAbandoned ? 'opacity-40' : ''}`}>
      {/* Column header (D-13) */}
      <h2 className="text-xs font-light tracking-[0.4em] uppercase text-verse-gold/70 mb-4">
        {label}
      </h2>

      {/* Depth indicator (D-10) */}
      <div className="flex gap-1.5 my-3">
        {Array.from({ length: MAX_DEPTH }, (_, i) => (
          <span
            key={i}
            className={i < currentDepth ? 'text-verse-gold' : 'text-verse-paper/30'}
          >
            {i < currentDepth ? '●' : '○'}
          </span>
        ))}
      </div>

      {/* Node list with AnimatePresence (D-14) */}
      <div className="flex flex-col gap-4 flex-1">
        <AnimatePresence>
          {pathState.nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="border-l-2 border-verse-gold/30 pl-3"
            >
              <p className="text-verse-paper/90 text-sm leading-relaxed">
                {node.content}
                {node.isStreaming && (
                  <span className="animate-pulse ml-0.5">|</span>
                )}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live streaming preview — not yet committed to store */}
        {isStreaming && streamingContent && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-verse-gold/40 pl-3"
          >
            <p className="text-verse-paper/70 text-sm leading-relaxed italic">
              {streamingContent}<span className="animate-pulse ml-0.5">|</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Expand / Path complete (D-11) */}
      {!pathState.isAbandoned && currentDepth < MAX_DEPTH && (
        <button
          onClick={onExpand}
          disabled={isStreaming}
          className="mt-4 text-xs text-verse-gold/70 hover:text-verse-gold border border-verse-gold/30 hover:border-verse-gold/60 px-3 py-1 tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentDepth === 0 ? 'Reveal path' : 'Go deeper'}
        </button>
      )}
      {!pathState.isAbandoned && currentDepth >= MAX_DEPTH && (
        <p className="mt-4 text-xs text-verse-paper/40 tracking-widest uppercase">
          Path complete
        </p>
      )}

      {/* Abandon button (D-12) — only when path has nodes and is not abandoned */}
      {!pathState.isAbandoned && currentDepth > 0 && (
        <button
          onClick={() => setActiveInterview(pathId)}
          className="text-xs text-verse-paper/30 hover:text-verse-paper/60 tracking-widest uppercase transition-colors mt-2"
        >
          Abandon
        </button>
      )}

      {/* Abandoned note */}
      {pathState.isAbandoned && (
        <p className="text-xs text-verse-paper/30 tracking-widest uppercase mt-2">
          Path abandoned
        </p>
      )}
    </div>
  );
}
