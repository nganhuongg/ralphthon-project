// components/PathTreeView.tsx
// Three-column path tree wrapper.
// Owns the three useCompletion instances (D-03, D-04).
// Passes streaming state down to PathColumn; commits finished nodes to Zustand store.

'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useCompletion } from '@ai-sdk/react';
import { useVerseStore } from '@/lib/store';
import PathColumn from './PathColumn';
import GriefInterviewOverlay from './GriefInterviewOverlay';
import GriefArchiveSidebar from './GriefArchiveSidebar';
import { nanoid } from 'nanoid';
import type { TuViChart, PathId, PathNode } from '@/lib/tuvi/types';

interface PathTreeViewProps {
  chart: TuViChart;
}

// PathConnectors — SVG incense smoke branch lines (UI-04)
// Three cubic bezier curves from center-top (480,0) to each column center bottom edge.
// viewBox="0 0 960 60" preserveAspectRatio="none" stretches to container width.
// Column centers: left=160, center=480, right=800 (three equal thirds of 960).
function PathConnectors({ isVisible }: { isVisible: boolean }) {
  // Paths: from (480,0) curving down to each column center at y=60
  const curves = [
    'M 480 0 C 480 30, 160 30, 160 60',   // center → left (Duty)
    'M 480 0 C 480 30, 480 30, 480 60',   // center → center (Desire) — straight drop
    'M 480 0 C 480 30, 800 30, 800 60',   // center → right (Transformation)
  ] as const;

  return (
    <svg
      width="100%"
      height="60"
      viewBox="0 0 960 60"
      preserveAspectRatio="none"
      className="pointer-events-none"
      aria-hidden="true"
    >
      {curves.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="#C9A84C"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: isVisible ? 1 : 0,
            opacity: isVisible ? 0.6 : 0,
          }}
          transition={{
            duration: 1.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: i * 0.15,  // stagger each branch slightly
          }}
        />
      ))}
    </svg>
  );
}

export default function PathTreeView({ chart }: PathTreeViewProps) {
  // ── Three useCompletion instances, one per path (D-03) ─────────────────────
  const dutyCompletion = useCompletion({ api: '/api/generate-node' });
  const desireCompletion = useCompletion({ api: '/api/generate-node' });
  const transformationCompletion = useCompletion({ api: '/api/generate-node' });

  // ── Store selectors ────────────────────────────────────────────────────────
  const paths = useVerseStore((s) => s.paths);
  const setPathNode = useVerseStore((s) => s.setPathNode);
  const griefEntries = useVerseStore((s) => s.griefEntries);

  // ── Map pathId -> completion instance ─────────────────────────────────────
  type CompletionHook = typeof dutyCompletion;
  const completions: Record<PathId, CompletionHook> = {
    duty: dutyCompletion,
    desire: desireCompletion,
    transformation: transformationCompletion,
  };

  // ── Build request body for a given path ────────────────────────────────────
  function buildBody(pathId: PathId): Record<string, unknown> {
    const pathState = paths[pathId];
    const nodes = pathState?.nodes ?? [];
    return {
      pathId,
      depth: nodes.length + 1,
      chart,
      previousNodes: nodes,
      griefContext: griefEntries.length > 0 ? griefEntries : undefined,
    };
  }

  // ── Expand handler — called by PathColumn's onExpand prop ─────────────────
  async function handleExpand(pathId: PathId) {
    const completion = completions[pathId];
    if (!completion) return;

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      );
      await Promise.race([
        completion.complete('', { body: buildBody(pathId) }),
        timeoutPromise,
      ]);
    } catch {
      // API failed or timed out — load fallback node for this path
      await loadFallbackNode(pathId);
      // Clean up any lingering streaming state
      completion.stop?.();
    }
  }

  // ── Refs to track isLoading transitions (one per path) ────────────────────
  const dutyPrevLoading = useRef(false);
  const desirePrevLoading = useRef(false);
  const transformationPrevLoading = useRef(false);

  // ── Fallback state ──────────────────────────────────────────────────────────
  const isFallbackActive = useRef(false);

  // ── Track fallback index per path so sequential expand calls get the next node ──
  const fallbackIndex = useRef<Record<PathId, number>>({
    duty: 0,
    desire: 0,
    transformation: 0,
  });

  // ── Load fallback node from public/fallback-demo.json ──────────────────────
  async function loadFallbackNode(pathId: PathId) {
    try {
      const res = await fetch('/fallback-demo.json');
      if (!res.ok) return;
      const data = (await res.json()) as {
        version: number;
        paths: Record<PathId, string[]>;
      };
      const pathNodes = data.paths[pathId];
      if (!pathNodes) return;
      const idx = fallbackIndex.current[pathId] ?? 0;
      const content = pathNodes[idx];
      if (!content) return;
      fallbackIndex.current[pathId] = idx + 1;
      isFallbackActive.current = true;
      const pathState = paths[pathId];
      const newNode: PathNode = {
        id: nanoid(),
        depth: (pathState?.nodes.length ?? 0) + 1,
        content,
        isStreaming: false,
      };
      setPathNode(pathId, newNode);
    } catch {
      // Fallback itself failed — silently do nothing
    }
  }

  // ── Commit duty node when streaming finishes ──────────────────────────────
  useEffect(() => {
    const c = dutyCompletion;
    if (dutyPrevLoading.current && !c.isLoading && c.completion) {
      const pathState = paths['duty'];
      const newNode: PathNode = {
        id: nanoid(),
        depth: (pathState?.nodes.length ?? 0) + 1,
        content: c.completion,
        isStreaming: false,
      };
      setPathNode('duty', newNode);
    }
    dutyPrevLoading.current = c.isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dutyCompletion.isLoading, dutyCompletion.completion]);

  // ── Commit desire node when streaming finishes ────────────────────────────
  useEffect(() => {
    const c = desireCompletion;
    if (desirePrevLoading.current && !c.isLoading && c.completion) {
      const pathState = paths['desire'];
      const newNode: PathNode = {
        id: nanoid(),
        depth: (pathState?.nodes.length ?? 0) + 1,
        content: c.completion,
        isStreaming: false,
      };
      setPathNode('desire', newNode);
    }
    desirePrevLoading.current = c.isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desireCompletion.isLoading, desireCompletion.completion]);

  // ── Commit transformation node when streaming finishes ────────────────────
  useEffect(() => {
    const c = transformationCompletion;
    if (transformationPrevLoading.current && !c.isLoading && c.completion) {
      const pathState = paths['transformation'];
      const newNode: PathNode = {
        id: nanoid(),
        depth: (pathState?.nodes.length ?? 0) + 1,
        content: c.completion,
        isStreaming: false,
      };
      setPathNode('transformation', newNode);
    }
    transformationPrevLoading.current = c.isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformationCompletion.isLoading, transformationCompletion.completion]);

  // ── Fire parallel root node generation when chart first becomes available (D-04) ──
  useEffect(() => {
    if (!chart) return;
    if ((paths['duty']?.nodes.length ?? 0) === 0) {
      void handleExpand('duty');
    }
    if ((paths['desire']?.nodes.length ?? 0) === 0) {
      void handleExpand('desire');
    }
    if ((paths['transformation']?.nodes.length ?? 0) === 0) {
      void handleExpand('transformation');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart]);

  // ── Render (D-13) ──────────────────────────────────────────────────────────
  return (
    <>
      <GriefInterviewOverlay />
      <div className="w-full flex gap-6 mt-8">
        <div className="flex-1 min-w-0">
          <PathConnectors isVisible={!!chart} />
          <div className="grid grid-cols-3 gap-6">
            <PathColumn
              pathId="duty"
              label="Duty"
              streamingContent={dutyCompletion.completion}
              isStreaming={dutyCompletion.isLoading}
              onExpand={() => handleExpand('duty')}
            />
            <PathColumn
              pathId="desire"
              label="Desire"
              streamingContent={desireCompletion.completion}
              isStreaming={desireCompletion.isLoading}
              onExpand={() => handleExpand('desire')}
            />
            <PathColumn
              pathId="transformation"
              label="Transformation"
              streamingContent={transformationCompletion.completion}
              isStreaming={transformationCompletion.isLoading}
              onExpand={() => handleExpand('transformation')}
            />
          </div>
        </div>
        <GriefArchiveSidebar />
      </div>
    </>
  );
}
