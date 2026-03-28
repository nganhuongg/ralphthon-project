// lib/store.ts
// Zustand v5 store — full shape defined in Phase 1 (D-10)
// Only griefEntries persisted to localStorage (via Zustand persist middleware)
// Zustand v5 note: use 'partialize' (NOT 'partialState') to scope persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TuViChart,
  BirthInput,
  PsychProfile,
  PathState,
  PathNode,
  PathId,
  GriefEntry,
} from './tuvi/types';

// ── Idle state factories ───────────────────────────────────────────────────────

function idlePathState(id: PathId): PathState {
  return {
    id,
    nodes: [],
    isAbandoned: false,
    abandonedAt: null,
  };
}

// ── Store interface ───────────────────────────────────────────────────────────

interface VerseStore {
  // ── Phase 1: chart + profile (populated this phase) ──────────────────────
  birthInput: BirthInput | null;
  chart: TuViChart | null;
  profile: PsychProfile | null;
  isCalculating: boolean;

  setBirthInput: (input: BirthInput) => void;
  setChart: (chart: TuViChart) => void;
  setProfile: (profile: PsychProfile) => void;
  setIsCalculating: (v: boolean) => void;
  resetChart: () => void;

  // ── Phase 2: path tree (shape defined, populated in Phase 2) ─────────────
  paths: Record<PathId, PathState>;
  setPathNode: (pathId: PathId, node: PathNode) => void;
  abandonPath: (pathId: PathId, depth: number, summary: string) => void;

  // ── Phase 3: grief interview state (shape defined, populated in Phase 3) ──
  activeInterview: {
    pathId: PathId | null;
    questionIndex: number;
    answers: string[];
  };
  setActiveInterview: (pathId: PathId | null) => void;
  advanceInterview: (answer: string) => void;
  clearInterview: () => void;

  // ── Persisted: grief archive (localStorage) ───────────────────────────────
  griefEntries: GriefEntry[];
  addGriefEntry: (entry: GriefEntry) => void;
  clearGriefArchive: () => void;
}

// ── Store implementation ──────────────────────────────────────────────────────

export const useVerseStore = create<VerseStore>()(
  persist(
    (set, _get) => ({
      // Phase 1
      birthInput: null,
      chart: null,
      profile: null,
      isCalculating: false,

      setBirthInput: (input) => set({ birthInput: input }),
      setChart: (chart) => set({ chart }),
      setProfile: (profile) => set({ profile }),
      setIsCalculating: (v) => set({ isCalculating: v }),
      resetChart: () =>
        set({
          birthInput: null,
          chart: null,
          profile: null,
          isCalculating: false,
          paths: {
            duty: idlePathState('duty'),
            desire: idlePathState('desire'),
            transformation: idlePathState('transformation'),
          },
          activeInterview: { pathId: null, questionIndex: 0, answers: [] },
        }),

      // Phase 2
      paths: {
        duty: idlePathState('duty'),
        desire: idlePathState('desire'),
        transformation: idlePathState('transformation'),
      },
      setPathNode: (pathId, node) =>
        set((state) => ({
          paths: {
            ...state.paths,
            [pathId]: {
              ...state.paths[pathId],
              nodes: [...(state.paths[pathId]?.nodes ?? []), node],
            },
          },
        })),
      abandonPath: (pathId, _depth, _summary) => {
        const ts = Date.now();
        // grief entry creation handled separately in Phase 3
        set((state) => ({
          paths: {
            ...state.paths,
            [pathId]: {
              ...state.paths[pathId],
              isAbandoned: true,
              abandonedAt: ts,
            },
          },
        }));
      },

      // Phase 3
      activeInterview: { pathId: null, questionIndex: 0, answers: [] },
      setActiveInterview: (pathId) =>
        set({ activeInterview: { pathId, questionIndex: 0, answers: [] } }),
      advanceInterview: (answer) =>
        set((state) => ({
          activeInterview: {
            ...state.activeInterview,
            questionIndex: state.activeInterview.questionIndex + 1,
            answers: [...state.activeInterview.answers, answer],
          },
        })),
      clearInterview: () =>
        set({ activeInterview: { pathId: null, questionIndex: 0, answers: [] } }),

      // Persisted
      griefEntries: [],
      addGriefEntry: (entry) =>
        set((state) => ({ griefEntries: [...state.griefEntries, entry] })),
      clearGriefArchive: () => set({ griefEntries: [] }),
    }),
    {
      name: 'verse-grief-archive',
      version: 1,
      // Zustand v5: 'partialize' (not 'partialState') scopes what gets saved
      partialize: (state) => ({ griefEntries: state.griefEntries }),
    }
  )
);
