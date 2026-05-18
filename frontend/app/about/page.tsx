'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { getMetadata } from '@/lib/data';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const metadata = getMetadata();

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
                ABOUT THIS MODEL
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-bold uppercase tracking-wider">
                Methodology, data sources, and limitations
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground space-y-4 leading-relaxed text-sm sm:text-base">
                <p>
                  This NBA Draft Model uses machine learning to objectively evaluate draft prospects
                  by analyzing college performance data and physical attributes. The goal is to
                  predict NBA success and identify similar player comparisons based on playing style.
                </p>
                <p>
                  Built as a portfolio project, this model demonstrates end-to-end data science
                  workflow: from data collection and feature engineering to model training,
                  interpretation, and deployment.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-secondary/50 rounded-xl p-4 sm:p-5 text-center border border-border">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Spearman Correlation</div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                    {metadata.modelPerformance.spearmanRho.toFixed(3)}
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 sm:p-5 text-center border border-border">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">RMSE</div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                    {metadata.modelPerformance.rmse.toFixed(3)}
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 sm:p-5 text-center border border-border">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">MAE</div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                    {metadata.modelPerformance.mae.toFixed(3)}
                  </div>
                </div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  <strong className="text-foreground">Spearman ρ = {metadata.modelPerformance.spearmanRho.toFixed(3)}</strong>:
                  Measures rank correlation between predicted and actual NBA success. A correlation above 0.35
                  indicates meaningful predictive power for draft rankings.
                </p>
                <p>
                  Validated using <strong className="text-foreground">leave-one-year-out cross-validation</strong> across
                  16 draft classes (2010-2025) to ensure the model generalizes to unseen prospects.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">1. Data Collection</h3>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-6 list-disc leading-relaxed">
                    <li>771 prospects from 2010-2026 draft classes</li>
                    <li>College statistics: points, assists, rebounds, shooting percentages</li>
                    <li>Physical measurements: height, age, international status</li>
                    <li>NBA outcomes: career impact scores based on Win Shares and seasons played</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">2. Feature Engineering</h3>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-6 list-disc leading-relaxed">
                    <li>Normalized per-40-minute statistics for fair comparison</li>
                    <li>Position-specific z-scores (guards vs. bigs)</li>
                    <li>Age adjustment: +5% boost per year younger than 19.5</li>
                    <li>Composite features: defensive impact, versatility, scoring efficiency</li>
                    <li>Advanced metrics: True Shooting %, AST/TO ratio, rim finishing %</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">3. Model Training</h3>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-6 list-disc leading-relaxed">
                    <li>Algorithm: <strong className="text-primary">XGBoost Regression</strong></li>
                    <li>Target variable: NBA Impact Score (career Win Shares + seasons played)</li>
                    <li>Hyperparameters: max_depth=4, learning_rate=0.05, n_estimators=200</li>
                    <li>Training set: 719 prospects with known NBA outcomes (2010-2025)</li>
                    <li>Validation: Leave-one-year-out cross-validation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">4. Model Interpretation</h3>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-6 list-disc leading-relaxed">
                    <li><strong className="text-primary">SHAP values</strong>: Explain which features drive each prediction</li>
                    <li>Global feature importance: Age (23.6%), Defensive Impact (7.6%), AST/TO (5.9%)</li>
                    <li>Individual explanations: Top 3 positive and negative factors per prospect</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">5. Player Comparisons</h3>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-6 list-disc leading-relaxed">
                    <li><strong className="text-primary">Cosine similarity</strong> on normalized playing style features</li>
                    <li>Excludes demographic features (age, height) to focus on skillset</li>
                    <li>Position-specific z-scores ensure fair comparisons</li>
                    <li>Minimum 25 NBA games played for historical player pool</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NBA Impact Score Explained */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Understanding the NBA Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">What is the NBA Impact Score?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    The NBA Impact Score is the <strong className="text-foreground">target variable</strong> the model predicts—a 
                    composite metric measuring career success in the NBA. It combines three components to create a holistic 
                    measure of a player&apos;s professional impact:
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">How It&apos;s Calculated</h3>
                  
                  <div className="space-y-4">
                    {/* Formula */}
                    <div className="bg-secondary/50 rounded-lg p-4 sm:p-5 border border-border">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Raw Calculation Formula</p>
                        <p className="text-sm sm:text-base lg:text-lg font-mono text-primary font-bold leading-relaxed">
                          Raw Score = Career Win Shares + Seasons Played + (Games Played / 100)
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                          Then standardized (z-score normalized) across all 719 historical players (2010-2025)
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                          <strong>Final Range:</strong> Approximately -5.5 to +6.7 (centered near 0)
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4 sm:p-5 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="text-primary font-bold text-lg sm:text-xl flex-shrink-0">1.</div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1 sm:mb-2">Career Win Shares (Primary)</h4>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Win Shares estimate how many wins a player contributed to their team over their career. 
                            This advanced stat accounts for both offensive and defensive contributions, providing a 
                            comprehensive measure of on-court value. Example: A player with 50 career Win Shares 
                            contributed approximately 50 wins above replacement level.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4 sm:p-5 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="text-primary font-bold text-lg sm:text-xl flex-shrink-0">2.</div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1 sm:mb-2">Seasons Played (Longevity Bonus)</h4>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Each season played adds +1 to the raw score. This rewards players who sustain NBA careers 
                            over multiple seasons, indicating consistent value and adaptability. A 10-year career adds 
                            +10 to the raw score, separating brief flashes from lasting contributors.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4 sm:p-5 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="text-primary font-bold text-lg sm:text-xl flex-shrink-0">3.</div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1 sm:mb-2">Games Played (Availability Factor)</h4>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Games played divided by 100 adds a bonus for durability. Playing 500 career games adds +5 
                            to the raw score. This accounts for availability—players who stay healthy and remain on 
                            the court provide more value than those frequently sidelined by injury or inconsistency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">Score Interpretation</h3>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:gap-4">
                      <div className="bg-gradient-to-r from-green-900/40 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-green-700/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">A+ (≥ 4.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Elite / MVP Level</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-900/30 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-green-700/40">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">A (3.0 - 4.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">All-Star Level</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-900/30 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-blue-700/40">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">B+ (2.0 - 3.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Quality Starter</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-900/20 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-blue-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">B (1.0 - 2.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Rotation Player</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-900/20 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-yellow-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">C (0.0 - 1.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Bench / Role Player</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-900/20 to-secondary/50 rounded-lg p-3 sm:p-4 border-2 border-red-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900 text-base sm:text-lg">D/F (&lt; 0.0)</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Limited NBA Impact</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 sm:p-5 bg-secondary/50 rounded-xl border border-border">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Observed Range:</strong> -5.5 to +6.7 based on 
                        719 historical players (2010-2025). The distribution is centered near 0 after z-score 
                        normalization, with positive scores indicating above-average NBA careers and negative 
                        scores indicating below-average impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                <div className="flex items-start gap-3">
                  <ExternalLink size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href="https://www.basketball-reference.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-foreground hover:text-primary transition-colors text-base sm:text-lg"
                    >
                      Basketball-Reference.com
                    </a>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      College basketball statistics and NBA career data. All scraping respects robots.txt
                      and includes 3-second rate limiting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExternalLink size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href="https://github.com/swar/nba_api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-foreground hover:text-primary transition-colors text-base sm:text-lg"
                    >
                      nba_api
                    </a>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      Official NBA API wrapper for combine measurements and supplemental data.
                      Rate limited to 0.6 seconds between requests.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 sm:p-5 bg-secondary/50 rounded-xl border border-border">
                  <p className="text-foreground leading-relaxed">
                    <strong>Data Currency:</strong> Model trained on data through
                    the 2025 draft class. Last updated: {metadata.lastUpdated}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Limitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Limitations & Disclaimers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">This model is for educational and portfolio purposes.</strong> It
                  should not be used for real draft decisions or betting. NBA success depends on many
                  factors this model cannot capture:
                </p>
                <ul className="ml-6 list-disc space-y-3">
                  <li>
                    <strong className="text-foreground">Injury history and durability</strong> — Career-altering
                    injuries dramatically impact outcomes but are unpredictable
                  </li>
                  <li>
                    <strong className="text-foreground">Team fit and opportunity</strong> — Playing time, role,
                    and coaching quality vary greatly across NBA teams
                  </li>
                  <li>
                    <strong className="text-foreground">Mental factors</strong> — Work ethic, coachability, and
                    psychological resilience are not measurable from statistics
                  </li>
                  <li>
                    <strong className="text-foreground">Sample size</strong> — 771 prospects is relatively small
                    for machine learning, limiting prediction confidence
                  </li>
                  <li>
                    <strong className="text-foreground">G-League and international prospects</strong> — Model trained
                    primarily on NCAA players, may not generalize well to other development paths
                  </li>
                  <li>
                    <strong className="text-foreground">Evolving game</strong> — NBA playstyle changes over time
                    (e.g., increased 3-point shooting), which may reduce model accuracy for recent classes
                  </li>
                </ul>
                <p className="mt-5 text-foreground font-medium">
                  Use this model as <strong>one input among many</strong> when evaluating prospects. Combine
                  quantitative analysis with scouting reports, game film, and domain expertise.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Technical Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 text-sm sm:text-base">
                <div>
                  <h3 className="font-bold text-foreground mb-3 sm:mb-4">ML Pipeline (Python)</h3>
                  <ul className="text-muted-foreground space-y-2 ml-4 list-disc leading-relaxed">
                    <li>XGBoost 3.2.0</li>
                    <li>SHAP 0.43+</li>
                    <li>scikit-learn 1.3+</li>
                    <li>pandas 2.1+</li>
                    <li>nba_api 1.4+</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-3 sm:mb-4">Frontend</h3>
                  <ul className="text-muted-foreground space-y-2 ml-4 list-disc leading-relaxed">
                    <li>Next.js 15 (App Router)</li>
                    <li>TypeScript (strict mode)</li>
                    <li>Tailwind CSS 3.4</li>
                    <li>Recharts 3.8</li>
                    <li>Vercel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact/Attribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-base text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  This project is open-source and available for educational use. Built as a portfolio
                  demonstration of end-to-end ML engineering and full-stack development.
                </p>
                <p>
                  <strong className="text-foreground">Version:</strong> {metadata.modelVersion} <span className="text-border mx-1">•</span>
                  <strong className="text-foreground">Last Updated:</strong> {metadata.lastUpdated}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
