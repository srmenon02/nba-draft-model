import type { Prospect } from '@/lib/types';
import { formatMetricName } from '@/lib/data';

interface PredictionExplanationProps {
  prospect: Prospect;
}

export default function PredictionExplanation({ prospect }: PredictionExplanationProps) {
  const { explanation, prediction } = prospect;

  return (
    <div className="bg-card border-2 border-border rounded-lg p-6">
      <h2 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Prediction Breakdown</h2>
      <p className="text-xs text-muted-foreground mb-6 font-bold uppercase tracking-wider">
        SHAP analysis showing which factors most influenced the NBA impact prediction
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div>
          <h3 className="text-base font-black text-tier-starter mb-4 flex items-center gap-2 uppercase tracking-tight">
            <span className="text-3xl">↑</span>
            Strengths
          </h3>
          <div className="space-y-3">
            {explanation.positiveFactors.map((factor, index) => (
              <div
                key={`positive-${index}`}
                className="bg-secondary/30 rounded-lg p-4 border-2 border-tier-starter/30 hover:border-tier-starter/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-foreground uppercase tracking-wide">
                    {formatMetricName(factor.feature)}
                  </span>
                  <span className="text-lg font-black text-tier-starter font-mono">
                    +{factor.contribution.toFixed(3)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Value: <span className="font-black text-foreground font-mono">{factor.value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Negative Factors */}
        <div>
          <h3 className="text-base font-black text-tier-bust mb-4 flex items-center gap-2 uppercase tracking-tight">
            <span className="text-3xl">↓</span>
            Concerns
          </h3>
          <div className="space-y-3">
            {explanation.negativeFactors.map((factor, index) => (
              <div
                key={`negative-${index}`}
                className="bg-secondary/30 rounded-lg p-4 border-2 border-tier-bust/30 hover:border-tier-bust/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-foreground uppercase tracking-wide">
                    {formatMetricName(factor.feature)}
                  </span>
                  <span className="text-lg font-black text-tier-bust font-mono">
                    {factor.contribution.toFixed(3)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Value: <span className="font-black text-foreground font-mono">{factor.value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t-2 border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-muted-foreground uppercase tracking-wider">Final Prediction</span>
          <div className="flex items-center gap-6">
            <div className="text-right bg-accent/10 border-2 border-accent/30 px-5 py-3 rounded">
              <div className="text-[9px] uppercase tracking-widest text-accent font-black mb-1">NBA IMPACT</div>
              <div className="text-2xl font-black text-accent font-mono">
                {prediction.nbaImpact >= 0 ? '+' : ''}{prediction.nbaImpact.toFixed(2)}
              </div>
            </div>
            <div className="text-right bg-secondary/30 border-2 border-primary/40 px-5 py-3 rounded">
              <div className="text-[9px] uppercase tracking-widest text-primary font-black mb-1">GRADE</div>
              <div className={`text-3xl font-black font-mono ${getGradeColor(prediction.grade)}`}>
                {prediction.grade}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-tier-elite';
  if (grade.startsWith('B')) return 'text-tier-starter';
  if (grade.startsWith('C')) return 'text-tier-role';
  return 'text-tier-bust';
}
