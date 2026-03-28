// components/ChartDisplay/PalaceCell.tsx
// Single palace cell in the 4×4 Tử Vi grid
// D-04: shows star names + palace label + English gloss
// D-05: isDominant palace gets gold border and glow (via motion animate)

'use client';

import { motion } from 'motion/react';
import { PALACE_GLOSSES } from '@/lib/tuvi/constants';
import type { Palace } from '@/lib/tuvi/types';

interface PalaceCellProps {
  palace: Palace;
}

export default function PalaceCell({ palace }: PalaceCellProps) {
  const gloss = PALACE_GLOSSES[palace.name] ?? '';

  return (
    <motion.div
      className="relative flex flex-col justify-between p-1.5 min-h-[80px] rounded-sm border"
      animate={{
        borderColor: palace.isDominant ? '#C9A84C' : 'rgba(201,168,76,0.2)',
        boxShadow: palace.isDominant
          ? '0 0 12px rgba(201,168,76,0.35), inset 0 0 8px rgba(201,168,76,0.08)'
          : 'none',
        backgroundColor: palace.isDominant
          ? 'rgba(201,168,76,0.05)'
          : 'rgba(26,10,0,0.6)',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Palace label + gloss (D-04) */}
      <div className="flex flex-col gap-0.5 mb-1">
        <span className="text-verse-gold text-[10px] font-medium leading-tight">
          {palace.name}
        </span>
        <span className="text-verse-paper/40 text-[8px] leading-tight">
          {gloss}
        </span>
      </div>

      {/* Star names */}
      <div className="flex flex-col gap-0.5 flex-1">
        {palace.stars.length === 0 ? (
          <span className="text-verse-paper/20 text-[8px] italic">—</span>
        ) : (
          palace.stars.map((star) => (
            <span
              key={star.name}
              className="text-verse-paper text-[9px] leading-tight"
            >
              {star.name}
            </span>
          ))
        )}
      </div>

      {/* Earthly branch + heavenly stem in corner */}
      <div className="absolute bottom-1 right-1.5 text-verse-gold/30 text-[7px]">
        {palace.heavenlyStem}{palace.earthlyBranch}
      </div>
    </motion.div>
  );
}
