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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-100 mb-2">
            What Matters Most?
          </h1>
          <p className="text-brand-400 text-sm sm:text-base">
            Feature importance rankings from SHAP analysis • Top 20 predictive factors for NBA success
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-100 mb-2 sm:mb-3">
            Feature Importance Rankings
          </h2>
          <p className="text-sm sm:text-base text-brand-400 mb-6 sm:mb-8 leading-relaxed">
            SHAP (SHapley Additive exPlanations) values show which features have the most impact
            on the model's predictions. Higher percentages indicate stronger influence.
          </p>
          <div className="-mx-4 sm:mx-0">
            <MetricImportanceChart data={metricImportance} />
          </div>
        </div>

        {/* Metric Descriptions */}
        <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-100 mb-6 sm:mb-8">
            Understanding the Metrics
          </h2>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {topMetrics.map((metric, index) => {
              const description = getMetricDescription(metric.metric);
              
              return (
                <div
                  key={metric.metric}
                  className="bg-brand-700 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-brand-600 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm text-brand-400 font-mono mt-1">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-100 mb-2 text-sm sm:text-base break-words">
                        {metric.metric}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-300 leading-relaxed">
                        {description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-accent">
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
        <div className="mt-6 sm:mt-8 lg:mt-10 bg-brand-800 border-2 border-brand-700 rounded-xl p-4 sm:p-6 lg:p-8">
          <h3 className="font-bold text-brand-100 mb-3 sm:mb-4 text-base sm:text-lg">About This Analysis</h3>
          <div className="text-sm sm:text-base text-brand-300 space-y-2 sm:space-y-3 leading-relaxed">
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
    // Demographic & Context
    'age_scaled': 'Age adjusted for draft position',
    'International': 'Whether the prospect played internationally vs. NCAA - reflects different development paths, competition levels, and professional experience.',
    'Height': 'Physical measurement in inches',
    'Strength of Schedule': 'Quality of competition faced in college - playing against tougher opponents provides better NBA readiness.',
    
    // Shooting Efficiency
    'True Shooting %': 'Overall shooting efficiency accounting for 2-pointers, 3-pointers, and free throws',
    'Free Throw %': 'Free throw shooting percentage',
    'Rim %': 'Field goal percentage at the rim',
    
    // Scoring
    'Points (per 40)': 'Points per 40 minutes',
    'Scoring Efficiency': 'Composite metric combining scoring volume with shooting efficiency',
    
    // Playmaking & Decision Making
    'Assists (per 40)': 'Assists per 40 minutes',
    'Playmaking': 'Composite playmaking metric including assist rate, creation opportunities, and offensive flow generation.',
    'Assist/Turnover Ratio': 'Assists divided by turnovers',
    'Turnovers (per 40)': 'Turnovers per 40 minutes',
    
    // Rebounding
    'Offensive Rebounds (per 40)': 'Offensive rebounds per 40 minutes',
    'Defensive Rebounds (per 40)': 'Defensive rebounds per 40 minutes',
    'Rebounding Rate': 'Composite rebounding metric adjusted for position',
    
    // Defense
    'Steals (per 40)': 'Steals per 40 minutes',
    'Blocks (per 40)': 'Blocks per 40 minutes',
    'Defensive Impact': 'Composite defensive metric combining steals, blocks, and defensive rebounds',
    
    // Versatility
    'Versatility': 'Composite metric measuring ability to contribute across multiple statistical categories',
  };

  return descriptions[metric] || 'This metric contributes to predicting NBA success based on historical patterns.';
}

