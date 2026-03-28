// components/PsychProfile.tsx
// Psychological profile card — displays synthesized prose from chart profile
// D-05: dominant palace name is visually emphasized
// PROF-05: displayed to user before paths are generated

'use client';

import type { PsychProfile as PsychProfileType } from '@/lib/tuvi/types';

interface PsychProfileProps {
  profile: PsychProfileType;
}

export default function PsychProfile({ profile }: PsychProfileProps) {
  return (
    <div className="w-full max-w-2xl mx-auto border border-verse-gold/30 rounded-sm p-6 bg-verse-black/60 flex flex-col gap-5">

      {/* Header */}
      <div className="border-b border-verse-gold/20 pb-4">
        <h3 className="text-verse-gold text-xs tracking-[0.25em] uppercase mb-2">
          Your Pattern
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-verse-gold text-lg font-light">
            {profile.dominantPalaceName}
          </span>
          <span className="text-verse-paper/40 text-xs">dominant palace</span>
        </div>
        {profile.riskStarName && (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-verse-ash-light text-sm">
              {profile.riskStarName}
            </span>
            <span className="text-verse-paper/30 text-xs">
              in {profile.riskStarPalace ?? '—'}
            </span>
          </div>
        )}
      </div>

      {/* Relational pattern (PROF-03) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-verse-gold/70 text-[10px] tracking-[0.2em] uppercase">
          How you connect
        </span>
        <p className="text-verse-paper/85 text-sm leading-relaxed">
          {profile.relationalPattern}
        </p>
      </div>

      {/* Ambition structure (PROF-04) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-verse-gold/70 text-[10px] tracking-[0.2em] uppercase">
          How you move toward things
        </span>
        <p className="text-verse-paper/85 text-sm leading-relaxed">
          {profile.ambitionStructure}
        </p>
      </div>

    </div>
  );
}
