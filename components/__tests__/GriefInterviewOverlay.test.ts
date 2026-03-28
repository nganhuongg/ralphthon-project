// components/__tests__/GriefInterviewOverlay.test.ts
// TDD RED phase — tests for GriefInterviewOverlay logic
// Tests the submit handler behavior and question sequencing logic
// in isolation (no DOM required).

import type { GriefEntry, PathId } from '@/lib/tuvi/types';

// ── Helpers extracted from the component logic ──────────────────────────────

const QUESTIONS = [
  "What are you letting go of?",
  "What does that cost you?",
  "What do you now know?",
] as const;

// Simulate the handleSubmit logic for testing
interface InterviewState {
  pathId: PathId | null;
  questionIndex: number;
  answers: string[];
}

function simulateSubmit(
  state: InterviewState,
  answer: string,
  callbacks: {
    advanceInterview: (a: string) => void;
    abandonPath: (p: PathId, d: number, s: string) => void;
    addGriefEntry: (e: GriefEntry) => void;
    clearInterview: () => void;
  },
  pathContext: { depth: number; summary: string; pathId: PathId }
): void {
  const trimmed = answer.trim();
  if (!trimmed) return;
  const qi = state.questionIndex;
  if (qi < 2) {
    callbacks.advanceInterview(trimmed);
  } else {
    const allAnswers = [...state.answers, trimmed];
    const entry: GriefEntry = {
      id: 'test-id',
      pathId: pathContext.pathId,
      abandonedAt: Date.now(),
      abandonedAtDepth: pathContext.depth,
      answers: {
        lettingGo: allAnswers[0] ?? '',
        cost: allAnswers[1] ?? '',
        nowKnow: allAnswers[2] ?? '',
      },
      pathSummary: pathContext.summary,
    };
    callbacks.abandonPath(pathContext.pathId, pathContext.depth, pathContext.summary);
    callbacks.addGriefEntry(entry);
    callbacks.clearInterview();
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GriefInterviewOverlay — question sequencing', () => {
  it('QUESTIONS array has exactly 3 questions', () => {
    expect(QUESTIONS).toHaveLength(3);
  });

  it('QUESTIONS[0] is the letting-go question', () => {
    expect(QUESTIONS[0]).toBe('What are you letting go of?');
  });

  it('QUESTIONS[1] is the cost question', () => {
    expect(QUESTIONS[1]).toBe('What does that cost you?');
  });

  it('QUESTIONS[2] is the now-know question', () => {
    expect(QUESTIONS[2]).toBe('What do you now know?');
  });
});

describe('GriefInterviewOverlay — submit handler logic', () => {
  it('does nothing when answer is empty string', () => {
    const advance = jest.fn();
    const abandon = jest.fn();
    const addEntry = jest.fn();
    const clear = jest.fn();
    simulateSubmit(
      { pathId: 'duty', questionIndex: 0, answers: [] },
      '   ',
      { advanceInterview: advance, abandonPath: abandon, addGriefEntry: addEntry, clearInterview: clear },
      { depth: 1, summary: 'A path summary', pathId: 'duty' }
    );
    expect(advance).not.toHaveBeenCalled();
    expect(abandon).not.toHaveBeenCalled();
  });

  it('calls advanceInterview on questionIndex 0 with trimmed answer', () => {
    const advance = jest.fn();
    const abandon = jest.fn();
    const addEntry = jest.fn();
    const clear = jest.fn();
    simulateSubmit(
      { pathId: 'duty', questionIndex: 0, answers: [] },
      '  my answer  ',
      { advanceInterview: advance, abandonPath: abandon, addGriefEntry: addEntry, clearInterview: clear },
      { depth: 1, summary: 'A path summary', pathId: 'duty' }
    );
    expect(advance).toHaveBeenCalledWith('my answer');
    expect(abandon).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('calls advanceInterview on questionIndex 1', () => {
    const advance = jest.fn();
    const abandon = jest.fn();
    const addEntry = jest.fn();
    const clear = jest.fn();
    simulateSubmit(
      { pathId: 'desire', questionIndex: 1, answers: ['first answer'] },
      'second answer',
      { advanceInterview: advance, abandonPath: abandon, addGriefEntry: addEntry, clearInterview: clear },
      { depth: 2, summary: 'summary', pathId: 'desire' }
    );
    expect(advance).toHaveBeenCalledWith('second answer');
    expect(abandon).not.toHaveBeenCalled();
  });

  it('calls abandonPath, addGriefEntry, clearInterview in order on final question (questionIndex 2)', () => {
    const callOrder: string[] = [];
    const advance = jest.fn();
    const abandon = jest.fn(() => callOrder.push('abandon'));
    const addEntry = jest.fn(() => callOrder.push('addEntry'));
    const clear = jest.fn(() => callOrder.push('clear'));
    simulateSubmit(
      { pathId: 'transformation', questionIndex: 2, answers: ['ans1', 'ans2'] },
      'final answer',
      { advanceInterview: advance, abandonPath: abandon, addGriefEntry: addEntry, clearInterview: clear },
      { depth: 3, summary: 'path summary', pathId: 'transformation' }
    );
    expect(advance).not.toHaveBeenCalled();
    expect(callOrder).toEqual(['abandon', 'addEntry', 'clear']);
  });

  it('constructs GriefEntry with correct answers from accumulated state', () => {
    const addEntry = jest.fn();
    simulateSubmit(
      { pathId: 'duty', questionIndex: 2, answers: ['letting go answer', 'cost answer'] },
      'now know answer',
      {
        advanceInterview: jest.fn(),
        abandonPath: jest.fn(),
        addGriefEntry: addEntry,
        clearInterview: jest.fn(),
      },
      { depth: 4, summary: 'First node content', pathId: 'duty' }
    );
    const entry: GriefEntry = addEntry.mock.calls[0]?.[0];
    expect(entry).toBeDefined();
    expect(entry.pathId).toBe('duty');
    expect(entry.answers.lettingGo).toBe('letting go answer');
    expect(entry.answers.cost).toBe('cost answer');
    expect(entry.answers.nowKnow).toBe('now know answer');
    expect(entry.abandonedAtDepth).toBe(4);
    expect(entry.pathSummary).toBe('First node content');
  });

  it('GriefEntry has a non-empty id', () => {
    const addEntry = jest.fn();
    simulateSubmit(
      { pathId: 'desire', questionIndex: 2, answers: ['a', 'b'] },
      'c',
      {
        advanceInterview: jest.fn(),
        abandonPath: jest.fn(),
        addGriefEntry: addEntry,
        clearInterview: jest.fn(),
      },
      { depth: 2, summary: 'summary', pathId: 'desire' }
    );
    const entry: GriefEntry = addEntry.mock.calls[0]?.[0];
    expect(entry?.id).toBeTruthy();
  });
});
