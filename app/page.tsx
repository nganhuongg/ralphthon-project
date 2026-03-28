'use client';

// app/page.tsx
// Root page. Mounts InputForm when no chart is present.
// Plan 04 will wire calculateChart into handleFormSubmit.

import InputForm from '@/components/InputForm';
import { useVerseStore } from '@/lib/store';
import type { BirthInput } from '@/lib/tuvi/types';

export default function Home() {
  const chart = useVerseStore((s) => s.chart);
  const isCalculating = useVerseStore((s) => s.isCalculating);

  function handleFormSubmit(input: BirthInput) {
    // Plan 04 will wire the actual calculateChart call here.
    // Logging to confirm the form is working during development.
    console.log('BirthInput submitted:', input);
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <header className="text-center">
        <h1 className="text-4xl font-light text-verse-gold tracking-[0.3em] uppercase">
          Verse
        </h1>
        <p className="text-verse-paper/50 text-sm mt-2 tracking-wide max-w-xs mx-auto">
          A mirror for conscious choice.
        </p>
      </header>

      {!chart && !isCalculating && (
        <InputForm onSubmit={handleFormSubmit} />
      )}

      {isCalculating && (
        <div className="text-verse-gold text-sm tracking-widest animate-pulse">
          Casting your chart...
        </div>
      )}

      {chart && (
        <div className="text-verse-paper/50 text-sm">
          Chart ready — display component coming in Plan 04
        </div>
      )}
    </div>
  );
}
