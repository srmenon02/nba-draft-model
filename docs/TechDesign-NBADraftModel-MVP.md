# Technical Design Document: NBA Draft Model MVP

## Executive Summary

**System:** NBA Draft Model
**Version:** MVP 1.0
**Architecture Pattern:** Jamstack — offline Python ML pipeline → static JSON → Next.js static site
**Estimated Effort:** 2 weeks (solo)
**Last Updated:** 2025-05-14

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BUILD TIME (Python)                      │
│                                                              │
│  Data Sources → Ingestion Scripts → Feature Engineering      │
│       → ML Models (Similarity + Success) → JSON Export       │
└───────────────────────────┬─────────────────────────────────┘
                            │ static JSON files
┌───────────────────────────▼─────────────────────────────────┐
│                   DEPLOY TIME (Next.js)                      │
│                                                              │
│  next build → reads /data/*.json → generates static pages   │
│       → Vercel CDN serves pre-built HTML/JS/CSS             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────────┐
│                     RUNTIME (Browser)                        │
│                                                              │
│  Client-side filtering/sorting → no API calls needed        │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Jamstack / static | $0 hosting, fast loads, no backend to maintain |
| ML inference | Offline only | All scores pre-computed at build time |
| Data freshness | Per draft season | Static dataset is sufficient; no real-time updates needed |
| Frontend | Next.js (App Router) | Strong static generation support, large ecosystem |
| Styling | Tailwind CSS | Design token-based, WCAG-friendly utilities |
| Data format | Static JSON in `/public/data/` | Read at build time via `getStaticProps` or direct import |

---

## Repository Structure

```
nba-draft-model/
├── pipeline/                    # Python ML pipeline
│   ├── notebooks/               # Jupyter exploration (not deployed)
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   ├── 03_model_training.ipynb
│   │   └── 04_similarity_engine.ipynb
│   ├── src/
│   │   ├── ingest/
│   │   │   ├── bball_ref.py     # Basketball-Reference scraper
│   │   │   ├── nba_api.py       # nba_api wrapper
│   │   │   └── combine.py       # Combine data ingestion
│   │   ├── features/
│   │   │   ├── normalize.py     # Per-possession, percentile normalization
│   │   │   ├── engineer.py      # Derived features, age adjustment
│   │   │   └── competition.py   # Conference/league strength adjustment
│   │   ├── models/
│   │   │   ├── similarity.py    # KNN / cosine similarity engine
│   │   │   ├── success.py       # XGBoost success prediction model
│   │   │   └── shap_analysis.py # Feature importance via SHAP
│   │   └── export/
│   │       └── build_json.py    # Writes all output JSON files
│   ├── data/
│   │   ├── raw/                 # Cached raw data (gitignored if large)
│   │   ├── processed/           # Cleaned, normalized datasets
│   │   └── models/              # Serialized model artifacts (.pkl)
│   ├── tests/
│   │   ├── test_features.py
│   │   ├── test_similarity.py
│   │   └── test_model_validity.py
│   ├── requirements.txt
│   └── run_pipeline.sh          # Single command to rebuild all JSON
│
├── frontend/                    # Next.js application
│   ├── public/
│   │   └── data/                # Output JSON files from pipeline
│   │       ├── prospects.json
│   │       ├── comparisons.json
│   │       ├── metric_importance.json
│   │       └── big_board.json
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── page.tsx         # Draft board (home)
│   │   │   ├── prospect/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Prospect profile
│   │   │   ├── metrics/
│   │   │   │   └── page.tsx     # Metric importance view
│   │   │   └── methodology/
│   │   │       └── page.tsx     # Data sources + model explanation
│   │   ├── components/
│   │   │   ├── ui/              # Base components (Button, Card, Badge)
│   │   │   ├── charts/          # Radar chart, bar chart, percentile bars
│   │   │   ├── prospect/        # ProspectCard, SimilarityComp, ArchetypeTag
│   │   │   └── layout/          # Header, Nav, Footer
│   │   ├── lib/
│   │   │   ├── data.ts          # JSON loaders and type-safe accessors
│   │   │   ├── filters.ts       # Client-side filter/sort logic
│   │   │   └── types.ts         # Shared TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css      # Tailwind base + design tokens
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.ts
│
├── .github/
│   └── workflows/
│       ├── pipeline.yml         # Python pipeline CI
│       └── deploy.yml           # Next.js build + Vercel deploy
├── .gitignore
└── README.md
```

---

## Python ML Pipeline

### Data Sources

| Source | Access Method | Data Available | Depth | ToS Notes |
|--------|--------------|----------------|-------|-----------|
| Basketball-Reference | Web scraping (requests + BeautifulSoup) | Historical player stats, advanced metrics, draft history (1947–present) | Full historical | Throttle requests; cache locally; personal/non-commercial use |
| nba_api (PyPI) | Python library wrapping stats.nba.com | Combine measurements, draft combine results, player bios | 2000–present | Unofficial; rate-limit sensitive; cache all responses |
| sports_reference (PyPI) | Library wrapper for B-Ref | College stats, player pages | Full historical | Same ToS as B-Ref scraping |
| Manual CSV (combine) | Static download from B-Ref or RealGM | Anthropometric + athletic testing data | 2000–present | One-time download, commit to repo |

**Data caching strategy:** All raw responses cached to `pipeline/data/raw/` as JSON/CSV. Pipeline skips re-fetching if cache exists. This prevents rate-limit issues and makes rebuilds fast.

### Feature Set

#### Pre-Draft Features (Input to Models)

**Scoring & Efficiency**
- Points per 40 minutes (college)
- True Shooting % (TS%)
- Effective Field Goal % (eFG%)
- Free throw rate (FTA/FGA)
- Free throw % (FT%)

**Playmaking**
- Assists per 40 minutes
- Assist-to-turnover ratio
- Turnovers per 40 minutes

**Rebounding**
- Total rebounds per 40 minutes
- Offensive rebound %
- Defensive rebound %

**Defense**
- Steal % 
- Block %
- Defensive rating (if available)

**Athleticism (Combine)**
- Height (w/ shoes)
- Wingspan
- Weight
- Standing reach
- Max vertical leap
- Lane agility time
- Three-quarter sprint time
- Bench press reps

**Context**
- Age at draft
- Years in college / pro league
- Conference strength coefficient (computed)
- Position (encoded)

#### Normalization Strategy

All counting stats normalized to **per-40 minutes** before any modeling. Percentile ranks computed **within draft class** for display. For similarity matching, features are **z-score normalized** across the full historical player pool.

**Age adjustment:** Younger players' stats are upweighted using a standard age-adjustment curve (based on typical NBA development trajectories). Formula documented in `pipeline/src/features/engineer.py`.

**Competition adjustment:** College conference strength ratings (sourced from Ken Pom or equivalent free source) applied as a multiplier to scoring/efficiency metrics.

### Target Variable: NBA Success

**Recommended definition:** `career_win_shares_per_48` over first 5 seasons, with a minimum games-played threshold (≥ 82 games) to filter out injury-limited players.

**Rationale vs alternatives:**

| Target Variable | Pros | Cons |
|----------------|------|------|
| Career win shares per 48 (recommended) | Stable, position-adjusted, correlates with team value | Requires 5-year patience; injury noise |
| Career BPM | Captures two-way impact, widely available | Noisy for low-minutes players early in career |
| All-Star appearances | Easy binary classification | Heavily skewed; too sparse for training |
| Career PER | Widely understood | Biased toward high-usage scorers |
| Games played (longevity) | Captures "made it" threshold | Doesn't distinguish starter from star |

**Bust threshold:** Players with < 82 career games labeled as "bust" class for classification variant of the model.

### ML Model Architecture

#### Model 1: Player Similarity Engine

**Purpose:** Given a current prospect's feature vector, find the N most similar historical players by pre-draft profile.

**Approach:** Cosine similarity on z-score normalized feature vectors.

**Why cosine similarity over alternatives:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Cosine similarity (recommended) | Fast, interpretable, handles high-dim well | Magnitude-insensitive | Best for normalized vectors |
| KNN (Euclidean) | Familiar, sklearn built-in | Sensitive to scale, slower at query | Good alternative |
| K-Means clustering | Groups archetypes naturally | Loses individual similarity granularity | Use for archetype view (P2) |
| Autoencoder | Learns latent features | Overkill for dataset size (~2000 players) | Post-MVP if needed |

**Implementation:**
```python
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def build_similarity_matrix(historical_df, feature_cols):
    scaler = StandardScaler()
    X = scaler.fit_transform(historical_df[feature_cols])
    sim_matrix = cosine_similarity(X)
    return sim_matrix, scaler, X

def get_top_comps(prospect_vector, historical_X, historical_df, scaler, n=5):
    prospect_scaled = scaler.transform([prospect_vector])
    sims = cosine_similarity(prospect_scaled, historical_X)[0]
    top_idx = np.argsort(sims)[::-1][:n]
    comps = historical_df.iloc[top_idx].copy()
    comps['similarity_score'] = sims[top_idx]
    return comps
```

**Output per prospect:** Top 5 historical comps with similarity score (0–1), their pre-draft stats, and their actual NBA career outcome.

#### Model 2: Success Prediction

**Purpose:** Predict career win shares per 48 for each current prospect.

**Approach:** XGBoost regressor with SHAP for feature importance.

**Why XGBoost:**

| Model | Pros | Cons | Verdict |
|-------|------|------|---------|
| XGBoost (recommended) | Best performance on tabular data, SHAP-compatible, handles missing values | Hyperparameter tuning needed | Best choice |
| Random Forest | Interpretable, robust | Slightly lower accuracy, slower SHAP | Good alternative |
| LightGBM | Faster than XGBoost | Less mature SHAP integration | Viable swap |
| Linear Regression | Fully interpretable | Misses non-linear interactions | Baseline only |
| Neural Net | Theoretically more expressive | Overkill for ~1500 training samples | Not warranted |

**Training data:** All drafted players 1990–2019 with complete college/pre-draft data and ≥ 3 NBA seasons (allows outcome measurement).

**Evaluation strategy:**
- Leave-one-draft-class-out cross-validation (not random splits — prevents data leakage across years)
- Metrics: MAE, RMSE, Spearman rank correlation (rank correlation most meaningful for draft ordering)
- Calibration check: top-quartile predicted players should have significantly higher actual outcomes

**Class imbalance handling:** Most drafted players are role players or busts. For classification variant, use `scale_pos_weight` in XGBoost or SMOTE on minority class (All-Stars/stars).

#### Model 3: Feature Importance (SHAP)

**Purpose:** Show which pre-draft metrics most predict NBA success — both globally and per prospect.

**Implementation:**
```python
import shap
import xgboost as xgb

model = xgb.XGBRegressor(...)
model.fit(X_train, y_train)

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_train)

global_importance = pd.DataFrame({
    'feature': feature_cols,
    'mean_abs_shap': np.abs(shap_values).mean(axis=0)
}).sort_values('mean_abs_shap', ascending=False)
```

**Output:** Ranked feature importance for global metric view + per-prospect SHAP breakdown showing which metrics most drove their predicted score.

### JSON Export Schema

All outputs written to `frontend/public/data/` by `pipeline/src/export/build_json.py`.

**`prospects.json`**
```json
[
  {
    "id": "cooper-flagg-2025",
    "name": "Cooper Flagg",
    "position": "SF",
    "school": "Duke",
    "age_at_draft": 18.4,
    "draft_year": 2025,
    "projected_pick": 1,
    "predicted_ws_per_48": 0.142,
    "predicted_percentile": 94,
    "archetype": "Two-Way Wing",
    "metrics": {
      "pts_per_40": { "value": 18.2, "percentile": 88 },
      "ts_pct": { "value": 0.581, "percentile": 82 },
      "ast_per_40": { "value": 4.1, "percentile": 71 },
      "reb_per_40": { "value": 8.9, "percentile": 85 },
      "stl_pct": { "value": 3.1, "percentile": 90 },
      "blk_pct": { "value": 4.2, "percentile": 88 },
      "wingspan": { "value": 84.5, "percentile": 76 }
    },
    "slug": "cooper-flagg-2025"
  }
]
```

**`comparisons.json`**
```json
{
  "cooper-flagg-2025": [
    {
      "player_id": "paul-george",
      "name": "Paul George",
      "draft_year": 2010,
      "similarity_score": 0.87,
      "shared_strengths": ["Two-way impact", "Wing rebounding", "Steal rate"],
      "career_ws_per_48": 0.138,
      "career_outcome_summary": "6x All-Star, elite two-way wing"
    }
  ]
}
```

**`metric_importance.json`**
```json
[
  {
    "metric": "ts_pct",
    "display_name": "True Shooting %",
    "mean_abs_shap": 0.041,
    "rank": 1,
    "description": "Measures scoring efficiency across all shot types. The single strongest predictor of NBA scoring translaton.",
    "higher_is_better": true
  }
]
```

**`big_board.json`**
```json
[
  {
    "rank": 1,
    "prospect_id": "cooper-flagg-2025",
    "name": "Cooper Flagg",
    "position": "SF",
    "predicted_percentile": 94,
    "tier": "Franchise Cornerstone"
  }
]
```

---

## Frontend Architecture

### Tech Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Next.js | 15.x | Strong static generation, App Router for layouts |
| Language | TypeScript | 5.x | Type-safe JSON parsing, better DX |
| Styling | Tailwind CSS | 3.x | Design token utilities, WCAG-friendly |
| Charts | Recharts | latest | React-native, accessible, no cost |
| Icons | Lucide React | latest | Free, consistent, tree-shakeable |
| Linting | ESLint + Prettier | latest | Consistent code style |

### Data Loading Strategy

All JSON files loaded at **build time** via `generateStaticParams` and direct imports. No client-side data fetching.

```typescript
// lib/data.ts
import prospectsData from '../../public/data/prospects.json'
import comparisonsData from '../../public/data/comparisons.json'
import metricImportanceData from '../../public/data/metric_importance.json'
import bigBoardData from '../../public/data/big_board.json'

export const getProspects = (): Prospect[] => prospectsData as Prospect[]
export const getComparisons = (prospectId: string): Comparison[] =>
  (comparisonsData as Record<string, Comparison[]>)[prospectId] ?? []
export const getMetricImportance = (): MetricImportance[] =>
  metricImportanceData as MetricImportance[]
```

### Key TypeScript Interfaces

```typescript
// lib/types.ts

interface MetricValue {
  value: number
  percentile: number
}

interface Prospect {
  id: string
  slug: string
  name: string
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C'
  school: string
  age_at_draft: number
  draft_year: number
  projected_pick: number
  predicted_ws_per_48: number
  predicted_percentile: number
  archetype: string
  metrics: Record<string, MetricValue>
}

interface Comparison {
  player_id: string
  name: string
  draft_year: number
  similarity_score: number
  shared_strengths: string[]
  career_ws_per_48: number
  career_outcome_summary: string
}

interface MetricImportance {
  metric: string
  display_name: string
  mean_abs_shap: number
  rank: number
  description: string
  higher_is_better: boolean
}

interface BigBoardEntry {
  rank: number
  prospect_id: string
  name: string
  position: string
  predicted_percentile: number
  tier: string
}
```

### Page Structure

**`/` — Draft Big Board**
- Server component, reads `big_board.json` at build time
- Client component for position filter and sort (no API call — filters in-memory)
- ProspectCard grid with name, position, tier badge, predicted percentile

**`/prospect/[slug]` — Prospect Profile**
- `generateStaticParams` generates one page per prospect
- Sections: Stats overview → Percentile radar chart → Player comps → SHAP breakdown
- All data available at build time

**`/metrics` — Metric Importance**
- Global SHAP importance bar chart
- Table of all metrics ranked with descriptions
- Static page, no interactivity required

**`/methodology` — About the Model**
- Markdown-driven content page
- Documents data sources, model approach, limitations, scope

### Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        900: '#0a0f1e',  // Deep navy background
        800: '#111827',  // Card background
        700: '#1f2937',  // Border / subtle
        400: '#6b7280',  // Muted text
        100: '#f9fafb',  // Primary text
      },
      accent: {
        DEFAULT: '#3b82f6',  // Primary blue
        hover:   '#2563eb',
      },
      tier: {
        elite:   '#f59e0b',  // Gold — franchise cornerstone
        starter: '#10b981',  // Green — solid starter
        role:    '#6b7280',  // Gray — role player
        bust:    '#ef4444',  // Red — bust risk
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    }
  }
}
```

**WCAG 2.1 AA compliance:** All color combinations verified to meet 4.5:1 contrast ratio minimum. Accent blue on navy background passes. Tier colors on card backgrounds verified.

---

## Development Workflow

### GitFlow Branch Strategy

```
main                    # Production — Vercel deploys from here
├── develop             # Integration branch
│   ├── feature/pipeline-data-ingestion
│   ├── feature/similarity-engine
│   ├── feature/xgboost-model
│   ├── feature/json-export
│   ├── feature/draft-board-ui
│   ├── feature/prospect-profile-ui
│   └── feature/metric-importance-ui
└── release/v1.0        # Pre-launch stabilization
```

### CI/CD: GitHub Actions

**Pipeline: `.github/workflows/pipeline.yml`**
Triggers on push to `develop` when `pipeline/**` files change.

```yaml
name: ML Pipeline
on:
  push:
    paths: ['pipeline/**']
    branches: [develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r pipeline/requirements.txt
      - run: cd pipeline && python src/export/build_json.py
      - name: Validate JSON outputs
        run: cd pipeline && python -m pytest tests/test_model_validity.py -v
      - name: Copy JSON to frontend
        run: cp pipeline/data/output/*.json frontend/public/data/
      - uses: actions/upload-artifact@v4
        with:
          name: json-outputs
          path: frontend/public/data/
```

**Deploy: `.github/workflows/deploy.yml`**
Triggers on push to `main`.

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Linting & Formatting

**Python (pipeline):**
```
black .          # Formatting
ruff check .     # Linting (replaces flake8 + isort)
```

**JavaScript/TypeScript (frontend):**
```
prettier --write .    # Formatting
eslint . --fix        # Linting
```

Pre-commit hooks (optional but recommended):
```bash
pip install pre-commit
# .pre-commit-config.yaml handles black, ruff, prettier, eslint
```

---

## Testing Strategy

Priority: **Model validity and output quality.**

### Python Pipeline Tests

**`tests/test_features.py`**
- Normalization produces values in expected ranges
- No NaN values in feature matrix after engineering
- Age adjustment coefficients are monotonic
- Competition adjustment multipliers are in valid range

**`tests/test_similarity.py`**
- Similarity scores are in [0, 1]
- Self-similarity = 1.0
- Top comp for a known player is a known reasonable comp (sanity check)
- No prospect returns itself as a comp (correctly filtered)

**`tests/test_model_validity.py`** — Primary test suite
```python
def test_rank_correlation():
    """Top-quartile predicted prospects should have significantly higher
    actual outcomes than bottom-quartile (Spearman rho > 0.35)."""

def test_top_picks_calibration():
    """Prospects predicted in top 10 should have > 60% hit rate
    (defined as > 0.100 career WS/48) on holdout draft classes."""

def test_no_data_leakage():
    """Training data for class N should contain zero players
    drafted in class N."""

def test_comp_face_validity():
    """Known prospects (e.g., LeBron James pre-draft) should return
    comps that are recognizable as comparable players."""

def test_json_schema():
    """All exported JSON files conform to expected schema
    (required keys present, value ranges valid)."""

def test_metric_importance_coverage():
    """All features used in model are present in metric_importance.json
    with non-zero SHAP values."""
```

### Frontend Tests

Minimal for MVP — focus on data loading and rendering correctness.

- TypeScript compilation passes (zero type errors)
- `getProspects()` returns array with expected shape
- ProspectCard renders without crashing for each fixture
- All pages build successfully (`next build` exits 0)
- WCAG audit: run `axe-core` or Lighthouse accessibility audit in CI

---

## Deployment

### Hosting: Vercel (Free Tier)

Vercel's free tier is appropriate for this project. Key free tier limits as of 2025 — verify current limits at vercel.com/pricing:
- Bandwidth: 100GB/month
- Builds: 100/day
- Serverless function executions: Not needed (fully static)

Since the site is 100% static, bandwidth and function limits are not a concern at side project scale.

### Deploy Steps

1. Push `frontend/` to GitHub
2. Import repo in Vercel dashboard
3. Set root directory to `frontend/`
4. Build command: `npm run build`
5. Output directory: `.next`
6. Add GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Environment Variables

None required for production (all data is static JSON). For local development:
```bash
# frontend/.env.local
# No secrets needed — all data is public JSON
```

---

## Cost Analysis

| Item | Tool | Cost | Verify At |
|------|------|------|-----------|
| Frontend hosting | Vercel (free tier) | $0 | vercel.com/pricing |
| Domain (optional) | None / GitHub Pages URL | $0 | — |
| Python runtime | Local machine / GitHub Actions | $0 | github.com/pricing |
| ML libraries | scikit-learn, XGBoost, pandas, SHAP | $0 | PyPI (open source) |
| Data sources | Basketball-Reference (scraping), nba_api | $0 | Confirm ToS |
| Frontend libraries | Next.js, Tailwind, Recharts | $0 | npm (open source) |
| CI/CD | GitHub Actions (free tier: 2000 min/month) | $0 | github.com/pricing |
| IDE | VS Code | $0 | code.visualstudio.com |
| AI assistant | GitHub Copilot | Free trial / paid | github.com/copilot |
| **Total** | | **$0** | |

**GitHub Copilot note:** Free tier available for individual developers as of 2025 — verify current availability at github.com/copilot.

**Data scraping risk:** Basketball-Reference has no official free API. Scraping for personal/non-commercial use is generally tolerated but not guaranteed. Mitigate by: caching all data locally after first fetch, respecting rate limits (1 request/3 seconds), and not redistributing raw scraped data.

---

## 2-Week Implementation Plan

### Week 1 — Python Pipeline

| Day | Task |
|-----|------|
| 1 | Repo setup, GitFlow init, requirements.txt, pre-commit hooks |
| 1–2 | Data ingestion scripts (B-Ref scraper, nba_api combine data) |
| 2–3 | Feature engineering (normalization, age adjustment, competition adjustment) |
| 3–4 | Jupyter exploration — model selection, hyperparameter tuning |
| 4–5 | Finalize XGBoost model + SHAP analysis |
| 5 | Cosine similarity engine |
| 5 | JSON export scripts + schema validation tests |

### Week 2 — Frontend + Integration

| Day | Task |
|-----|------|
| 6 | Next.js project init, Tailwind config, design tokens, TypeScript interfaces |
| 6–7 | Draft Big Board page (list + client-side filter) |
| 7–8 | Prospect Profile page (stats, radar chart, comps, SHAP breakdown) |
| 8 | Metric Importance page + Methodology page |
| 9 | WCAG audit, accessibility fixes, mobile responsive testing |
| 9 | GitHub Actions CI/CD setup + Vercel deployment |
| 10 | End-to-end review, model validity spot checks, final polish |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Insufficient combine data for current class | High | High | Fall back to college stats only; document gap in methodology page |
| B-Ref scraping blocked or rate-limited | Medium | High | Cache aggressively after first successful scrape; commit cached data to repo |
| Model produces unintuitive comps for known prospects | Medium | High | Validate manually against known "ground truth" comps before export; document confidence bounds |
| 2-week timeline slips on ML pipeline | High | Medium | Cut P1 features (big board, team fit) without affecting P0 deliverables |
| Vercel free tier limits hit | Low | Low | Site is static; 100GB bandwidth far exceeds side project traffic |
| TypeScript type errors in JSON parsing | Medium | Low | Define strict interfaces upfront; use `zod` for runtime JSON validation if needed |

---

## Limitations & Known Trade-offs

- **No real-time data:** Model is only as current as the last pipeline run. For an active draft season, the pipeline should be re-run when significant combine/workout data becomes available.
- **Small training set:** ~1,500 drafted players with complete data since 1990. This limits model complexity — XGBoost with regularization is appropriate; deep learning is not.
- **Positional bias:** The model may undervalue non-traditional skills (e.g., defensive versatility) if those metrics are poorly captured in college box scores.
- **International players:** Adjusting for non-NCAA competition level is an approximation. Predictions for international prospects carry higher uncertainty.
- **Combine incompleteness:** Not all draft prospects participate in the combine. Missing combine data is handled via median imputation — documented in methodology.

---

## Definition of Technical Done

- [ ] Python pipeline runs end-to-end from `run_pipeline.sh` with no errors
- [ ] All `test_model_validity.py` tests pass
- [ ] Spearman rank correlation on holdout draft classes > 0.35
- [ ] All P0 JSON outputs present and schema-valid
- [ ] `next build` exits 0 with no TypeScript errors
- [ ] All pages render correctly on desktop (1280px) and mobile (375px)
- [ ] Lighthouse accessibility score ≥ 90
- [ ] WCAG 2.1 AA: zero critical violations in automated audit
- [ ] GitHub Actions pipeline and deploy workflows pass on `main`
- [ ] Live Vercel URL accessible without login

---

*Version: 1.0*
*Last Updated: 2025-05-14*
*Next Review: Post-launch*
