'use client';

import type { Position } from '@/lib/types';

interface PositionFilterProps {
  selectedPosition: Position | 'ALL';
  onPositionChange: (position: Position | 'ALL') => void;
  positionCounts: Record<Position | 'ALL', number>;
}

const positions: (Position | 'ALL')[] = ['ALL', 'Guard', 'Wing', 'Big'];

export default function PositionFilter({
  selectedPosition,
  onPositionChange,
  positionCounts,
}: PositionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {positions.map((position) => {
        const isActive = selectedPosition === position;
        const count = positionCounts[position] || 0;

        return (
          <button
            key={position}
            onClick={() => onPositionChange(position)}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
              isActive
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'bg-brand-800 text-brand-400 hover:bg-brand-700 hover:text-brand-100 border border-brand-700'
            }`}
            aria-pressed={isActive}
          >
            {position}
            <span className="ml-2 text-xs font-normal opacity-75">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
