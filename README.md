# NBA Draft Model

<p align="center">
  <strong>Machine learning model for evaluating NBA draft prospects using XGBoost and SHAP analysis</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License"/></a>
  <img src="https://img.shields.io/badge/Python-3.13+-blue?style=flat-square&logo=python" alt="Python 3.13+"/>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
</p>

---

## Overview

A data-driven web application that objectively evaluates NBA draft prospects using machine learning. The model analyzes college basketball statistics, strength of schedule, team quality, and demographic factors to predict NBA success and generate player comparisons.

**Live Demo:** [Coming Soon - Deploy to Vercel]

---

## Features

- **🎯 Draft Big Board**: Ranked list of 2026 NBA draft prospects with predicted NBA impact scores
- **📊 Player Profiles**: Detailed prospect pages with statistics, predictions, and SHAP explanations
- **🔍 Player Comparisons**: Position and size-weighted similarity matching with NBA historical players
- **📈 Feature Importance**: Interactive visualization of which metrics matter most for NBA success
- **♿ Accessible Design**: WCAG 2.1 AA compliant, keyboard navigable, mobile responsive

---

## Tech Stack

### Machine Learning Pipeline (Python)
- **XGBoost** - Gradient boosting regression model
- **SHAP** - Feature importance and prediction explanations
- **scikit-learn** - Data preprocessing and validation
- **pandas/numpy** - Data manipulation
- **Leave-One-Year-Out CV** - Temporal validation across 16 draft classes (2010-2025)

### Frontend (Next.js)
- **Next.js 16** - Static site generation (SSG) with App Router
- **TypeScript** - Strict mode, full type safety
- **Tailwind CSS** - Utility-first styling with custom dark theme
- **Recharts** - Interactive data visualizations
- **Vercel** - Deployment and hosting

### Architecture
**Jamstack** - Offline Python pipeline generates static JSON → Next.js SSG → Vercel CDN

---

## Model Performance

| Metric | Value |
|--------|-------|
| **Spearman Correlation** | 0.383 |
| **RMSE** | 1.701 |
| **MAE** | 1.323 |
| **Training Set** | 719 players (2010-2025 drafts) |
| **Test Set** | 49 prospects (2026 draft class) |

**Top Predictive Features:**
1. Age (23.6%) - Younger players have higher upside
2. Defensive Composite (7.6%) - Rebounds + steals + blocks
3. Assist-to-Turnover Ratio (5.9%)
4. International Status (5.4%)
5. Three-Point Percentage (4.8%)

---

## Project Structure

```
nba-draft-model/
├── pipeline/              # Python ML pipeline
│   ├── src/
│   │   ├── ingest/       # Data loading and collection
│   │   ├── features/     # Feature engineering
│   │   ├── models/       # XGBoost training, SHAP, similarity
│   │   └── export/       # JSON generation for frontend
│   ├── data/
│   │   ├── draft-model-data.csv     # Base dataset
│   │   ├── models/                   # Model artifacts
│   │   └── processed/                # Intermediate outputs
│   ├── requirements.txt
│   └── run_pipeline.sh              # Full pipeline execution
│
├── frontend/             # Next.js application
│   ├── app/
│   │   ├── page.tsx                 # Home / big board
│   │   ├── prospect/[slug]/         # Dynamic prospect pages
│   │   ├── metrics/                 # Feature importance
│   │   └── about/                   # Methodology
│   ├── components/                  # React components
│   ├── lib/                         # Data utilities
│   ├── public/data/                 # Static JSON exports
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python 3.13+** with pip
- **Node.js 18+** with npm
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/srmenon02/nba-draft-model.git
cd nba-draft-model
```

2. **Set up Python environment**
```bash
cd pipeline
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

---

## Usage

### Run the ML Pipeline

Rebuild the model and regenerate all JSON exports:

```bash
cd pipeline
bash run_pipeline.sh
```

This will:
1. Load and validate the dataset (771 players)
2. Engineer features with age adjustment and composites
3. Train XGBoost model with LOYO cross-validation
4. Generate SHAP explanations
5. Compute player similarity scores
6. Export 5 JSON files to `frontend/public/data/`

**Expected output:** 5 JSON files (~2-3 MB total) in `frontend/public/data/`

### Run the Frontend

**Development mode:**
```bash
cd frontend
npm run dev
```
Visit http://localhost:3000

**Production build:**
```bash
cd frontend
npm run build
npm start
```

Generates 54 static HTML pages in `out/` directory.

---

## Deployment

### Deploy to Vercel (Free)

1. **Push to GitHub** (already done)
2. **Connect to Vercel:**
   - Visit https://vercel.com/
   - Click "Add New Project"
   - Import `srmenon02/nba-draft-model`
   - **Set Root Directory:** `frontend` ⚠️
   - Deploy

3. **Configuration:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `out`

Live in ~2-3 minutes at `your-project.vercel.app`

---

## Data Sources

- **College Statistics:** Basketball-Reference.com (2010-2026)
- **NBA Outcomes:** Basketball-Reference.com career stats
- **Strength of Schedule:** KenPom ratings
- **Team Quality:** Historical conference strength data
- **Draft Data:** Official NBA draft results

---

## Model Methodology

### Target Variable
**NBA_impact** = Composite metric combining:
- Career Win Shares (primary)
- Seasons played (longevity bonus)
- Games played (availability factor)

### Features (22 total)
- **Demographics:** Age, height, international status
- **Production:** PPG, RPG, APG, SPG, BPG (per-40 normalized)
- **Efficiency:** FG%, 3P%, FT%, TS%
- **Context:** Strength of schedule, team strength
- **Composites:** Scoring efficiency, defensive composite, assist-to-turnover ratio

### Training Approach
- **Model:** XGBoost Regression
- **Validation:** Leave-One-Year-Out Cross-Validation (16 folds, 2010-2025)
- **Regularization:** L1=1.0, L2=3.0, max_depth=3, n_estimators=150
- **Explainability:** SHAP values for global and local interpretability

### Player Similarity Algorithm
**Final Similarity Score = 50% Playing Style + 30% Position + 20% Height**

- **Playing Style:** Cosine similarity on normalized performance metrics
- **Position Match:** Same position = 1.0, adjacent = 0.5, different = 0.0
- **Height Match:** Within 2" = 1.0, decays linearly to 0.0 at 6"+

---

## Limitations

- **Historical bias:** Model trained on 2010-2025 drafts; NBA trends evolve
- **Sample size:** 719 training examples; limited data for rare player types
- **College-only:** Does not include international league statistics
- **No injuries:** Does not account for injury history or medical data
- **Static predictions:** Model does not update with real-time performance

---

## Roadmap

- [ ] Deploy to Vercel
- [ ] Add Lighthouse performance audit
- [ ] Integrate international league stats (EuroLeague, ACB)
- [ ] Add injury data from Spotrac
- [ ] Build comparison tool (compare multiple prospects side-by-side)
- [ ] Add historical draft class reviews
- [ ] Implement model retraining pipeline with new seasons

---

## Testing

**Python tests:**
```bash
cd pipeline
pytest tests/ -v
```

**Frontend linting:**
```bash
cd frontend
npm run lint
npm run build  # Type checking + build verification
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Data Sources:** Basketball-Reference.com, KenPom
- **ML Libraries:** XGBoost, SHAP, scikit-learn
- **Frontend Framework:** Next.js, Tailwind CSS
- **Inspiration:** Basketball analytics community, NBA draft evaluation research

---

<p align="center">
  <strong>Built with ❤️ for NBA draft enthusiasts</strong>
</p>
