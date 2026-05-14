import type { Comparison } from '@/lib/types';
import { getGradeColor } from '@/lib/data';

interface PlayerComparisonsProps {
  comparisons: Comparison[];
}

export default function PlayerComparisons({ comparisons }: PlayerComparisonsProps) {
  // Show top 5 comparisons
  const topComparisons = comparisons.slice(0, 5);

  if (topComparisons.length === 0) {
    return (
      <div className="bg-brand-800 border border-brand-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-brand-100 mb-4">Similar NBA Players</h2>
        <p className="text-brand-400">No comparisons available.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-brand-100 mb-2">Similar NBA Players</h2>
      <p className="text-sm text-brand-400 mb-6">
        Based on playing style, physical attributes, and college production
      </p>
      
      <div className="space-y-4">
        {topComparisons.map((comp, index) => {
          const impactColor = comp.nbaImpact >= 3 ? 'text-tier-elite' :
                              comp.nbaImpact >= 0 ? 'text-tier-starter' :
                              comp.nbaImpact >= -2 ? 'text-tier-role' :
                              'text-tier-bust';
          
          return (
            <div
              key={`${comp.name}-${index}`}
              className="flex items-center justify-between p-5 bg-brand-700 rounded-xl hover:bg-brand-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-brand-400 font-mono w-8">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-100 text-base">{comp.name}</h3>
                    <p className="text-sm text-brand-400">
                      {comp.position} <span className="text-brand-500">•</span> {comp.draftYear} Draft <span className="text-brand-500">•</span> {comp.nbaSeasons} seasons
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-xs uppercase tracking-wide text-brand-500 mb-1">Similarity</div>
                <div className="text-xl font-bold text-accent">
                  {(comp.similarityScore * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="text-right ml-4 min-w-[80px]">
                <div className="text-xs uppercase tracking-wide text-brand-500 mb-1">NBA Impact</div>
                <div className={`text-xl font-bold ${impactColor}`}>
                  {comp.nbaImpact >= 0 ? '+' : ''}{comp.nbaImpact.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-brand-700">
        <p className="text-sm text-brand-400">
          Similarity calculated using cosine similarity on normalized playing style metrics
        </p>
      </div>
    </div>
  );
}
