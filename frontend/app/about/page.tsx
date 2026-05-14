import { getMetadata } from '@/lib/data';
import { ExternalLink } from 'lucide-react';

export default function AboutPage() {
  const metadata = getMetadata();

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-brand-800 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-100 mb-2">
            About This Model
          </h1>
          <p className="text-brand-400 text-sm sm:text-base">
            Methodology, data sources, and limitations
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Overview */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-5">Project Overview</h2>
          <div className="text-brand-300 space-y-4 leading-relaxed text-base">
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
        </section>

        {/* Model Performance */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-6">Model Performance</h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-brand-700 rounded-xl p-5 text-center border-2 border-brand-600">
              <div className="text-xs uppercase tracking-wide text-brand-400 mb-2">Spearman Correlation</div>
              <div className="text-3xl font-bold text-accent">
                {metadata.modelPerformance.spearmanRho.toFixed(3)}
              </div>
            </div>
            <div className="bg-brand-700 rounded-xl p-5 text-center border-2 border-brand-600">
              <div className="text-xs uppercase tracking-wide text-brand-400 mb-2">RMSE</div>
              <div className="text-3xl font-bold text-brand-200">
                {metadata.modelPerformance.rmse.toFixed(3)}
              </div>
            </div>
            <div className="bg-brand-700 rounded-xl p-5 text-center border-2 border-brand-600">
              <div className="text-xs uppercase tracking-wide text-brand-400 mb-2">MAE</div>
              <div className="text-3xl font-bold text-brand-200">
                {metadata.modelPerformance.mae.toFixed(3)}
              </div>
            </div>
          </div>
          <div className="text-base text-brand-300 space-y-3 leading-relaxed">
            <p>
              <strong className="text-brand-100">Spearman ρ = {metadata.modelPerformance.spearmanRho.toFixed(3)}</strong>:
              Measures rank correlation between predicted and actual NBA success. A correlation above 0.35
              indicates meaningful predictive power for draft rankings.
            </p>
            <p>
              Validated using <strong className="text-brand-100">leave-one-year-out cross-validation</strong> across
              16 draft classes (2010-2025) to ensure the model generalizes to unseen prospects.
            </p>
          </div>
        </section>

        {/* Methodology */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-6">Methodology</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3">1. Data Collection</h3>
              <ul className="text-base text-brand-300 space-y-2 ml-6 list-disc leading-relaxed">
                <li>771 prospects from 2010-2026 draft classes</li>
                <li>College statistics: points, assists, rebounds, shooting percentages</li>
                <li>Physical measurements: height, age, international status</li>
                <li>NBA outcomes: career impact scores based on Win Shares and seasons played</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3">2. Feature Engineering</h3>
              <ul className="text-base text-brand-300 space-y-2 ml-6 list-disc leading-relaxed">
                <li>Normalized per-40-minute statistics for fair comparison</li>
                <li>Position-specific z-scores (guards vs. bigs)</li>
                <li>Age adjustment: +5% boost per year younger than 19.5</li>
                <li>Composite features: defensive impact, versatility, scoring efficiency</li>
                <li>Advanced metrics: True Shooting %, AST/TO ratio, rim finishing %</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3">3. Model Training</h3>
              <ul className="text-base text-brand-300 space-y-2 ml-6 list-disc leading-relaxed">
                <li>Algorithm: <strong className="text-accent">XGBoost Regression</strong></li>
                <li>Target variable: NBA Impact Score (career Win Shares + seasons played)</li>
                <li>Hyperparameters: max_depth=4, learning_rate=0.05, n_estimators=200</li>
                <li>Training set: 719 prospects with known NBA outcomes (2010-2025)</li>
                <li>Validation: Leave-one-year-out cross-validation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3">4. Model Interpretation</h3>
              <ul className="text-base text-brand-300 space-y-2 ml-6 list-disc leading-relaxed">
                <li><strong className="text-accent">SHAP values</strong>: Explain which features drive each prediction</li>
                <li>Global feature importance: Age (23.6%), Defensive Impact (7.6%), AST/TO (5.9%)</li>
                <li>Individual explanations: Top 3 positive and negative factors per prospect</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3">5. Player Comparisons</h3>
              <ul className="text-base text-brand-300 space-y-2 ml-6 list-disc leading-relaxed">
                <li><strong className="text-accent">Cosine similarity</strong> on normalized playing style features</li>
                <li>Excludes demographic features (age, height) to focus on skillset</li>
                <li>Position-specific z-scores ensure fair comparisons</li>
                <li>Minimum 25 NBA games played for historical player pool</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-6">Data Sources</h2>
          <div className="space-y-4 text-base text-brand-300">
            <div className="flex items-start gap-3">
              <ExternalLink size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <a
                  href="https://www.basketball-reference.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-100 hover:text-accent transition-colors text-lg"
                >
                  Basketball-Reference.com
                </a>
                <p className="text-brand-300 mt-2 leading-relaxed">
                  College basketball statistics and NBA career data. All scraping respects robots.txt
                  and includes 3-second rate limiting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ExternalLink size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <a
                  href="https://github.com/swar/nba_api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-100 hover:text-accent transition-colors text-lg"
                >
                  nba_api
                </a>
                <p className="text-brand-300 mt-2 leading-relaxed">
                  Official NBA API wrapper for combine measurements and supplemental data.
                  Rate limited to 0.6 seconds between requests.
                </p>
              </div>
            </div>

            <div className="mt-6 p-5 bg-brand-700 rounded-xl border-2 border-brand-600">
              <p className="text-brand-200 leading-relaxed">
                <strong className="text-brand-100">Data Currency:</strong> Model trained on data through
                the 2025 draft class. Last updated: {metadata.lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-6">Limitations & Disclaimers</h2>
          <div className="space-y-4 text-base text-brand-300 leading-relaxed">
            <p>
              <strong className="text-brand-100">This model is for educational and portfolio purposes.</strong> It
              should not be used for real draft decisions or betting. NBA success depends on many
              factors this model cannot capture:
            </p>
            <ul className="ml-6 list-disc space-y-3">
              <li>
                <strong className="text-brand-100">Injury history and durability</strong> — Career-altering
                injuries dramatically impact outcomes but are unpredictable
              </li>
              <li>
                <strong className="text-brand-100">Team fit and opportunity</strong> — Playing time, role,
                and coaching quality vary greatly across NBA teams
              </li>
              <li>
                <strong className="text-brand-100">Mental factors</strong> — Work ethic, coachability, and
                psychological resilience are not measurable from statistics
              </li>
              <li>
                <strong className="text-brand-100">Sample size</strong> — 771 prospects is relatively small
                for machine learning, limiting prediction confidence
              </li>
              <li>
                <strong className="text-brand-100">G-League and international prospects</strong> — Model trained
                primarily on NCAA players, may not generalize well to other development paths
              </li>
              <li>
                <strong className="text-brand-100">Evolving game</strong> — NBA playstyle changes over time
                (e.g., increased 3-point shooting), which may reduce model accuracy for recent classes
              </li>
            </ul>
            <p className="mt-5 text-brand-200 font-medium">
              Use this model as <strong>one input among many</strong> when evaluating prospects. Combine
              quantitative analysis with scouting reports, game film, and domain expertise.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-6">Technical Stack</h2>
          <div className="grid sm:grid-cols-2 gap-8 text-base">
            <div>
              <h3 className="font-bold text-brand-100 mb-4">ML Pipeline (Python)</h3>
              <ul className="text-brand-300 space-y-2 ml-4 list-disc leading-relaxed">
                <li>XGBoost 3.2.0</li>
                <li>SHAP 0.43+</li>
                <li>scikit-learn 1.3+</li>
                <li>pandas 2.1+</li>
                <li>nba_api 1.4+</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brand-100 mb-4">Frontend</h3>
              <ul className="text-brand-300 space-y-2 ml-4 list-disc leading-relaxed">
                <li>Next.js 15 (App Router)</li>
                <li>TypeScript (strict mode)</li>
                <li>Tailwind CSS 3.4</li>
                <li>Recharts 3.8</li>
                <li>Deployed on Vercel</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-5 bg-brand-700 rounded-xl border-2 border-brand-600">
            <p className="text-brand-200 leading-relaxed">
              <strong className="text-brand-100">Architecture:</strong> Jamstack — Offline Python pipeline generates static JSON → Next.js static
              site generation → Vercel CDN (free tier, $0 cost)
            </p>
          </div>
        </section>

        {/* Contact/Attribution */}
        <section className="bg-brand-800 border-2 border-brand-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-100 mb-5">Project Information</h2>
          <div className="text-base text-brand-300 space-y-3 leading-relaxed">
            <p>
              This project is open-source and available for educational use. Built as a portfolio
              demonstration of end-to-end ML engineering and full-stack development.
            </p>
            <p>
              <strong className="text-brand-100">Version:</strong> {metadata.modelVersion} <span className="text-brand-500">•</span>{' '}
              <strong className="text-brand-100">Last Updated:</strong> {metadata.lastUpdated}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

