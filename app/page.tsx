'use client';

// app/page.tsx
// Root page — full Phase 1 flow:
// InputForm → calculateChart (synchronous) → ChartDisplay + PsychProfile

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InputForm from '@/components/InputForm';
import ChartDisplay from '@/components/ChartDisplay/ChartDisplay';
import PsychProfile from '@/components/PsychProfile';
import PathTreeView from '@/components/PathTreeView';
import { useVerseStore } from '@/lib/store';
import { calculateChart } from '@/lib/tuvi/index';
import type { BirthInput } from '@/lib/tuvi/types';

// CRITICAL: useSearchParams must be in a child component wrapped in <Suspense>
// Placing it directly in the default export causes a Next.js 14 build error.
function ResetHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetChart = useVerseStore((s) => s.resetChart);
  const clearGriefArchive = useVerseStore((s) => s.clearGriefArchive);

  useEffect(() => {
    if (searchParams.has('reset')) {
      resetChart();
      clearGriefArchive(); // full clean slate — clears grief archive too (per UI-SPEC Copywriting Contract)
      router.replace('/');
    }
  }, [searchParams, resetChart, clearGriefArchive, router]);

  return null;
}

export default function Home() {
  const chart = useVerseStore((s) => s.chart);
  const isCalculating = useVerseStore((s) => s.isCalculating);
  const setChart = useVerseStore((s) => s.setChart);
  const setProfile = useVerseStore((s) => s.setProfile);
  const setIsCalculating = useVerseStore((s) => s.setIsCalculating);

  function handleFormSubmit(input: BirthInput) {
    setIsCalculating(true);
    try {
      // calculateChart is synchronous — no async needed
      const result = calculateChart(input);
      setChart(result);
      setProfile(result.profile);
    } catch (err) {
      console.error('Chart calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 pt-8 pb-16">
      <Suspense fallback={null}>
        <ResetHandler />
      </Suspense>

      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-light text-verse-gold tracking-[0.3em] uppercase">
          Verse
        </h1>
        <p className="text-verse-paper/50 text-sm mt-2 tracking-wide">
          A mirror for conscious choice.
        </p>
      </header>

      {/* Input form — shown when no chart yet */}
      {!chart && !isCalculating && (
        <InputForm onSubmit={handleFormSubmit} />
      )}

      {/* Calculating state */}
      {isCalculating && (
        <div className="text-verse-gold text-sm tracking-[0.25em] uppercase animate-pulse mt-8">
          Casting your chart...
        </div>
      )}

      {/* Chart + profile — shown after calculation */}
      {chart && !isCalculating && (
        <div className="w-full flex flex-col items-center gap-8">
          <ChartDisplay chart={chart} />
          <PsychProfile profile={chart.profile} />
          <PathTreeView chart={chart} />
        </div>
      )}

    </div>
  );
}
