'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';
import { getBigBoard, getMetadata } from '@/lib/data';
import type { Position } from '@/lib/types';
import ProspectCard from '@/components/ProspectCard';
import PositionFilter from '@/components/PositionFilter';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const allProspects = getBigBoard(); // Already sorted by predicted impact
  const metadata = getMetadata();
  
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'impact' | 'name'>('impact');

  // Calculate position counts
  const positionCounts = useMemo(() => {
    const counts: Record<Position | 'ALL', number> = {
      ALL: allProspects.length,
      Guard: 0,
      Wing: 0,
      Big: 0,
    };
    
    allProspects.forEach((prospect) => {
      counts[prospect.position] = (counts[prospect.position] || 0) + 1;
    });
    
    return counts;
  }, [allProspects]);

  // Filter and sort prospects
  const displayedProspects = useMemo(() => {
    let filtered = allProspects;
    
    // Filter by position
    if (selectedPosition !== 'ALL') {
      filtered = filtered.filter((p) => p.position === selectedPosition);
    }
    
    // Sort
    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    // If sortBy === 'impact', it's already sorted from getBigBoard()
    
    return sorted;
  }, [allProspects, selectedPosition, sortBy]);

  return (
    <main className="flex-1 bg-spotlight">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b-4 border-primary bg-card/50 backdrop-blur-sm relative overflow-hidden"
      >
        {/* Decorative angular lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-10 w-1 h-full bg-primary transform -skew-x-12" />
          <div className="absolute top-0 right-10 w-1 h-full bg-accent transform skew-x-12" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground mb-3 font-sans tracking-tighter uppercase leading-none jersey-number">
                2026 NBA DRAFT BIG BOARD
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="border-b border-border bg-card/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PositionFilter
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              positionCounts={positionCounts}
            />
          </div>
        </div>
      </motion.div>

      {/* Prospects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-court-texture">
        {displayedProspects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No prospects found for this position.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProspects.map((prospect, index) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                rank={sortBy === 'impact' && selectedPosition === 'ALL' ? index + 1 : undefined}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
