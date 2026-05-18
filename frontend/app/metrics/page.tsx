'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import { getMetricImportance } from '@/lib/data';
import MetricImportanceChart from '@/components/MetricImportanceChart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricsPage() {
  const metricImportance = getMetricImportance();
  
  // Sort by importance descending
  const topMetrics = [...metricImportance]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20);

  return (
    <main className="flex-1 bg-spotlight">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b-4 border-primary relative overflow-hidden"
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
                WHAT MATTERS MOST?
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-white text-sm sm:text-base font-bold uppercase tracking-wider">
                  Feature importance rankings from SHAP analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Feature Importance Rankings</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                SHAP (SHapley Additive exPlanations) values show which features have the most impact
                on the model's predictions. Higher percentages indicate stronger influence.
              </p>
            </CardHeader>
            <CardContent>
              <div className="-mx-2 sm:mx-0">
                <MetricImportanceChart data={metricImportance} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metric Descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Understanding the Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {topMetrics.map((metric, index) => {
                  const description = getMetricDescription(metric.metric);
                  
                  return (
                    <motion.div
                      key={metric.metric}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.03 }}
                      className="bg-secondary/50 rounded-lg p-4 sm:p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base break-words">
                            {metric.metric}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-primary font-mono">
                            {metric.importancePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Methodology Note */}
        <div className="mt-6 sm:mt-8 lg:mt-10 bg-card border-2 border-border rounded-lg p-4 sm:p-6 lg:p-8">
          <h3 className="font-black text-foreground mb-3 sm:mb-4 text-base sm:text-lg uppercase tracking-tight">About This Analysis</h3>
          <div className="text-sm sm:text-base text-muted-foreground space-y-2 sm:space-y-3 leading-relaxed">
            <p>
              <strong className="text-foreground font-black">SHAP (SHapley Additive exPlanations)</strong> is a
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
    'Height (Position-Normalized)': 'Height as z-score relative to position group',
    'Weight (Position-Normalized)': 'Weight as z-score relative to position group',
    'Strength of Schedule': 'Quality of competition faced in college',
    'Team Strength': 'Overall quality of player\'s college team',
    
    // Shooting Efficiency
    'True Shooting %': 'Overall shooting efficiency accounting for 2-pointers, 3-pointers, and free throws',
    'Free Throw %': 'Free throw shooting percentage',
    'Rim %': 'Field goal percentage at the rim',
    
    // Scoring
    'Points (per 40)': 'Points per 40 minutes',
    'Scoring Efficiency': 'Composite metric combining scoring volume with shooting efficiency',
    
    // Playmaking & Decision Making
    'Assists (per 40)': 'Assists per 40 minutes',
    'Playmaking (Position-Normalized)': 'Composite playmaking metric (assists, creation, offensive flow) evaluated relative to position',
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

    'wingspan_to_height': 'Ratio of wingspan to height',

  };

  return descriptions[metric] || 'This metric contributes to predicting NBA success based on historical patterns.';
}

