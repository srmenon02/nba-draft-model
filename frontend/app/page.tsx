'use client';

import { useState, useMemo } from 'react';
import { getBigBoard, getMetadata } from '@/lib/data';
import type { Position } from '@/lib/types';
import ProspectCard from '@/components/ProspectCard';
import PositionFilter from '@/components/PositionFilter';

export default function HomePage() {
  const allProspects = getBigBoard(); // Already sorted by predicted impact
  const metadata = getMetadata();
  
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'impact' | 'name'>('impact');

  // Calculate position counts
  const positionCounts = useMemo(() => {
    const counts: Record<Position | 'ALL', number> = {
      ALL: allProspects.length,
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
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
    <main className="flex-1">
      {/* Header Section */}
      <div className="bg-brand-800 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-100 mb-2">
            2026 NBA Draft Big Board
          </h1>
          <p className="text-brand-400 text-sm sm:text-base">
            Machine learning-powered prospect rankings • Model Performance: Spearman ρ ={' '}
            {metadata.modelPerformance.spearmanRho.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-brand-900 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PositionFilter
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              positionCounts={positionCounts}
            />
            
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-brand-300">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'impact' | 'name')}
                className="bg-brand-800 text-brand-100 border border-brand-700 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="impact">Predicted Impact</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-5 text-base text-brand-400 font-medium">
            Showing <span className="text-brand-200">{displayedProspects.length}</span> of <span className="text-brand-200">{allProspects.length}</span> prospects
          </div>
        </div>
      </div>

      {/* Prospects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {displayedProspects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-400 text-xl">No prospects found for this position.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProspects.map((prospect, index) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                rank={sortBy === 'impact' && selectedPosition === 'ALL' ? index + 1 : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
