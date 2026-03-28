// components/PathTreeView.tsx
// Three-column path tree wrapper.
// Owns the three useCompletion instances (D-03, D-04).
// Passes streaming state down to PathColumn; commits finished nodes to Zustand store.

'use client';

import { useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useVerseStore } from '@/lib/store';
import PathColumn from './PathColumn';
import { nanoid } from 'nanoid';
import type { TuViChart, PathId, PathNode } from '@/lib/tuvi/types';

interface PathTreeViewProps {
  chart: TuViChart;
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
    await completion.complete('', {
      body: buildBody(pathId),
    });
  }

  // ── Refs to track isLoading transitions (one per path) ────────────────────
  const dutyPrevLoading = useRef(false);
  const desirePrevLoading = useRef(false);
  const transformationPrevLoading = useRef(false);

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
    <div className="w-full grid grid-cols-3 gap-6 mt-8">
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
  );
}
