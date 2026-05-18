'use client';

import { motion } from 'framer-motion';
import type { Position } from '@/lib/types';
import { cn } from '@/lib/utils';

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
          <motion.button
            key={position}
            onClick={() => onPositionChange(position)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border hover:border-primary/50'
            )}
            aria-pressed={isActive}
          >
            {position}
            <span className="ml-2 text-xs font-normal opacity-75">({count})</span>
            {isActive && (
              <motion.div
                layoutId="activePosition"
                className="absolute inset-0 bg-primary rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
