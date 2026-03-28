// components/ChartDisplay/ChartDisplay.tsx
// Chart container: heading + PalaceGrid

'use client';

import PalaceGrid from './PalaceGrid';
import type { TuViChart } from '@/lib/tuvi/types';

interface ChartDisplayProps {
  chart: TuViChart;
}

export default function ChartDisplay({ chart }: ChartDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-verse-gold text-sm tracking-[0.2em] uppercase">
          Lá Số Tử Vi
        </h2>
        <span className="text-verse-paper/40 text-xs">
          {chart.input.solarDate.day}/{chart.input.solarDate.month}/{chart.input.solarDate.year}
        </span>
      </div>
      <PalaceGrid chart={chart} />
    </div>
  );
}
