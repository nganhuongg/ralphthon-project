// components/ChartDisplay/PalaceGrid.tsx
// 4×4 grid layout — 12 outer palaces + center 2×2 chart metadata
// Layout per D-03 and RESEARCH.md Pattern 5

'use client';

import React from 'react';
import PalaceCell from './PalaceCell';
import { PALACE_GRID_POSITIONS } from '@/lib/tuvi/constants';
import type { TuViChart } from '@/lib/tuvi/types';

interface PalaceGridProps {
  chart: TuViChart;
}

export default function PalaceGrid({ chart }: PalaceGridProps) {
  // Build a 4×4 grid array (null = empty cell slot)
  // Fill with palace components by position
  const grid: (React.ReactNode | null)[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null)
  );

  // Place each palace in its grid position
  for (const palace of chart.palaces) {
    const pos = PALACE_GRID_POSITIONS[palace.index];
    if (pos) {
      const [row, col] = pos;
      if (grid[row]) {
        grid[row]![col] = <PalaceCell key={palace.index} palace={palace} />;
      }
    }
  }

  return (
    <div
      className="w-full gap-1"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, auto)',
      }}
    >
      {grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isCenter = rowIdx >= 1 && rowIdx <= 2 && colIdx >= 1 && colIdx <= 2;
          const centerKey = `center-${rowIdx}-${colIdx}`;
          const outerKey = `outer-${rowIdx}-${colIdx}`;

          if (isCenter) {
            // Center cells: only render the inner content once at [1,1] spanning 2×2
            if (rowIdx === 1 && colIdx === 1) {
              return (
                <div
                  key={centerKey}
                  style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
                  className="flex flex-col items-center justify-center p-2 border border-verse-gold/20 rounded-sm bg-verse-black/80"
                >
                  {/* Chart metadata center */}
                  <span className="text-verse-gold text-xs font-light tracking-widest">
                    {chart.lunarDate.yearCanChi}
                  </span>
                  <span className="text-verse-paper/50 text-[9px] mt-0.5">
                    {chart.lunarDate.monthCanChi}
                  </span>
                  <span className="text-verse-paper/50 text-[9px]">
                    {chart.lunarDate.dayCanChi}
                  </span>
                  {chart.lunarDate.gioName && (
                    <span className="text-verse-paper/40 text-[8px] mt-0.5">
                      Giờ {chart.lunarDate.gioName}
                    </span>
                  )}
                </div>
              );
            }
            // Skip other center cells — they're part of the 2×2 span
            return null;
          }

          return (
            <div key={outerKey}>
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}
