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
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight">Similar NBA Players</h2>
        <p className="text-muted-foreground font-bold uppercase tracking-wider">No comparisons available.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-lg p-6">
      <h2 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Similar NBA Players</h2>
      <p className="text-xs text-muted-foreground mb-6 font-bold uppercase tracking-wider">
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
              className="flex items-center justify-between p-5 bg-secondary/30 border-l-4 border-primary rounded hover:border-accent hover:bg-secondary/50 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-primary font-black font-mono w-8 bg-primary/20 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-black text-foreground text-base uppercase tracking-tight">{comp.name}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      {comp.position} <span className="text-primary">▪</span> {comp.draftYear} Draft <span className="text-primary">▪</span> {comp.nbaSeasons} seasons
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4 bg-accent/10 border-2 border-accent/30 px-4 py-3 rounded">
                <div className="text-[9px] uppercase tracking-widest text-accent font-black mb-1">SIMILARITY</div>
                <div className="text-2xl font-black text-accent font-mono">
                  {(comp.similarityScore * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="text-right ml-4 min-w-[100px] bg-secondary/30 border-2 border-border px-4 py-3 rounded">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mb-1">NBA IMPACT</div>
                <div className={`text-2xl font-black font-mono ${impactColor}`}>
                  {comp.nbaImpact >= 0 ? '+' : ''}{comp.nbaImpact.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t-2 border-border">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Similarity calculated using cosine similarity on normalized playing style metrics
        </p>
      </div>
    </div>
  );
}
