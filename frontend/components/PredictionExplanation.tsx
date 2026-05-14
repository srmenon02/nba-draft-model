import type { Prospect } from '@/lib/types';
import { formatMetricName } from '@/lib/data';

interface PredictionExplanationProps {
  prospect: Prospect;
}

export default function PredictionExplanation({ prospect }: PredictionExplanationProps) {
  const { explanation, prediction } = prospect;

  return (
    <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-brand-100 mb-2">Prediction Breakdown</h2>
      <p className="text-sm text-brand-400 mb-6">
        SHAP analysis showing which factors most influenced the NBA impact prediction
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div>
          <h3 className="text-lg font-semibold text-tier-starter mb-4 flex items-center gap-2">
            <span className="text-2xl">↑</span>
            Strengths
          </h3>
          <div className="space-y-3">
            {explanation.positiveFactors.map((factor, index) => (
              <div
                key={`positive-${index}`}
                className="bg-brand-700 rounded-lg p-4 border border-brand-600 hover:border-tier-starter/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-brand-200">
                    {formatMetricName(factor.feature)}
                  </span>
                  <span className="text-base font-bold text-tier-starter">
                    +{factor.contribution.toFixed(3)}
                  </span>
                </div>
                <div className="text-sm text-brand-400">
                  Value: <span className="font-semibold text-brand-300">{factor.value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Negative Factors */}
        <div>
          <h3 className="text-lg font-semibold text-tier-bust mb-4 flex items-center gap-2">
            <span className="text-2xl">↓</span>
            Concerns
          </h3>
          <div className="space-y-3">
            {explanation.negativeFactors.map((factor, index) => (
              <div
                key={`negative-${index}`}
                className="bg-brand-700 rounded-lg p-4 border border-brand-600 hover:border-tier-bust/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-brand-200">
                    {formatMetricName(factor.feature)}
                  </span>
                  <span className="text-base font-bold text-tier-bust">
                    {factor.contribution.toFixed(3)}
                  </span>
                </div>
                <div className="text-sm text-brand-400">
                  Value: <span className="font-semibold text-brand-300">{factor.value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-brand-700">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-brand-400">Final Prediction</span>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-brand-500 mb-1">NBA Impact Score</div>
              <div className="text-2xl font-bold text-accent">
                {prediction.nbaImpact >= 0 ? '+' : ''}{prediction.nbaImpact.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-brand-500 mb-1">Grade</div>
              <div className={`text-3xl font-bold ${getGradeColor(prediction.grade)}`}>
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
