import { getMetricImportance } from '@/lib/data';
import MetricImportanceChart from '@/components/MetricImportanceChart';

export default function MetricsPage() {
  const metricImportance = getMetricImportance();
  
  // Sort by importance descending
  const topMetrics = [...metricImportance]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20);

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-brand-800 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-100 mb-2">
            What Matters Most?
          </h1>
          <p className="text-brand-400 text-sm sm:text-base">
            Feature importance rankings from SHAP analysis • Top 20 predictive factors for NBA success
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-brand-100 mb-3">
            Feature Importance Rankings
          </h2>
          <p className="text-base text-brand-400 mb-8 leading-relaxed">
            SHAP (SHapley Additive exPlanations) values show which features have the most impact
            on the model's predictions. Higher percentages indicate stronger influence.
          </p>
          <MetricImportanceChart data={metricImportance} />
        </div>

        {/* Metric Descriptions */}
        <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-8">
            Understanding the Metrics
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {topMetrics.map((metric, index) => {
              const description = getMetricDescription(metric.metric);
              
              return (
                <div
                  key={metric.metric}
                  className="bg-brand-700 rounded-xl p-5 border border-brand-600 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-sm text-brand-400 font-mono mt-1">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-100 mb-2 text-base">
                        {metric.metric}
                      </h3>
                      <p className="text-sm text-brand-300 leading-relaxed">
                        {description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent">
                        {metric.importancePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-10 bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h3 className="font-bold text-brand-100 mb-4 text-lg">About This Analysis</h3>
          <div className="text-base text-brand-300 space-y-3 leading-relaxed">
            <p>
              <strong className="text-brand-100">SHAP (SHapley Additive exPlanations)</strong> is a
              game-theoretic approach to explain machine learning predictions. It calculates the
              contribution of each feature to the final prediction.
            </p>
            <p>
              These importance rankings are based on analyzing {metricImportance.length} features across
              719 historical draft prospects (2010-2025). The model uses XGBoost regression with
              leave-one-year-out cross-validation.
            </p>
            <p>
              Higher importance percentages indicate that a feature has a larger average impact on
              the model's predictions across all prospects. This helps identify which player
              attributes are most predictive of NBA success.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function getMetricDescription(metric: string): string {
  const descriptions: Record<string, string> = {
    'Age': 'Younger prospects have more development potential and longer NBA careers ahead.',
    'Defensive Impact': 'Combined defensive metrics including steals, blocks, and defensive rebounds per 40 minutes.',
    'Assist/Turnover Ratio': 'Decision-making quality - higher ratios indicate better court vision and ball security.',
    'Rim %': 'Shooting efficiency at the rim - a key indicator of finishing ability and athleticism.',
    'Free Throw %': 'Free throw shooting accuracy - often correlates with overall shooting touch and work ethic.',
    'Versatility': 'Composite metric measuring ability to contribute across multiple statistical categories.',
    'True Shooting %': 'Overall shooting efficiency accounting for 2-pointers, 3-pointers, and free throws.',
    '3-Point %': 'Three-point shooting accuracy - increasingly important in the modern NBA.',
    'International': 'Whether the prospect played internationally vs. NCAA - different development paths.',
    'Height': 'Physical attribute - height in inches. Size matters for position versatility and defense.',
    'Rebounding Impact': 'Combined rebounding metrics (offensive + defensive) adjusted for position.',
    'Scoring Volume': 'Points per 40 minutes - raw scoring production normalized for playing time.',
    'Playmaking': 'Assist-related metrics indicating passing ability and offensive creation.',
    'Usage Rate': 'Percentage of team possessions used while on the court - measures offensive responsibility.',
    'Athleticism': 'Composite metric based on blocks, steals, and rim finishing efficiency.',
    'Minutes Per Game': 'Average minutes played - indicates trust from coaching staff and stamina.',
    'Games Played': 'Total games in college career - durability and experience indicator.',
    'Assists per 40': 'Assists normalized per 40 minutes of play.',
    'Blocks per 40': 'Blocks normalized per 40 minutes - rim protection ability.',
    'Steals per 40': 'Steals normalized per 40 minutes - defensive anticipation and quick hands.',
  };

  return descriptions[metric] || 'This metric contributes to predicting NBA success based on historical patterns.';
}

