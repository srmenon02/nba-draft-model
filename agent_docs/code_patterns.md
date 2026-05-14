# Code Patterns

## Purpose
This file defines the implementation patterns the agent should follow for this project.
Prefer these patterns over inventing new ones.

## Architecture Pattern
- **Primary pattern:** Jamstack — Offline data processing → Static JSON → Static Site Generation
- **Python Pipeline:** Functional programming style with clear data transformations
- **Frontend:** Feature-based folder structure using Next.js App Router
- **Rule:** Keep ML/data logic completely separate from frontend rendering
- **Rule:** No runtime API calls — all data is pre-computed and served as static JSON

## Repository Structure

```
nba-draft-model/
├── pipeline/                    # Python ML pipeline (isolated)
│   ├── src/
│   │   ├── ingest/              # Data scraping and caching
│   │   ├── features/            # Feature engineering
│   │   ├── models/              # ML model training and inference
│   │   └── export/              # JSON generation
│   ├── data/
│   │   ├── raw/                 # Cached API responses (gitignored if large)
│   │   ├── processed/           # Cleaned datasets
│   │   └── models/              # Serialized models (.pkl)
│   ├── tests/                   # Pipeline tests
│   └── requirements.txt
│
└── frontend/                    # Next.js application (isolated)
    ├── public/data/             # JSON outputs from pipeline
    ├── src/
    │   ├── app/                 # Next.js App Router pages
    │   ├── components/          # React components
    │   ├── lib/                 # Utilities and data loaders
    │   └── styles/
    └── package.json
```

## Data Flow Pattern

**Python Pipeline → JSON → Next.js Build → Static HTML**

1. **Python pipeline** runs offline, scrapes data, trains models, exports JSON
2. **JSON files** placed in `frontend/public/data/`
3. **Next.js build** reads JSON at build time via imports
4. **Static pages** generated for all routes (no server needed)
5. **Client-side filtering** uses in-memory data (no API calls)

## Python Pipeline Patterns

### Data Caching Strategy
**Always cache external API responses to avoid rate limits and ToS violations.**

```python
import json
from pathlib import Path
import requests

def fetch_with_cache(url: str, cache_path: Path, force_refresh: bool = False) -> dict:
    """
    Fetch data with local caching. Returns cached data if available.
    
    Args:
        url: URL to fetch
        cache_path: Path to cache file
        force_refresh: If True, ignore cache and re-fetch
    """
    if cache_path.exists() and not force_refresh:
        print(f"Loading from cache: {cache_path}")
        return json.loads(cache_path.read_text())
    
    print(f"Fetching from {url}")
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(response.text)
    
    return response.json()
```

### Feature Engineering Pattern
```python
import pandas as pd
import numpy as np

def normalize_per_40(df: pd.DataFrame, stat_cols: list[str]) -> pd.DataFrame:
    """
    Normalize counting stats to per-40-minute basis.
    
    Args:
        df: DataFrame with raw stats and 'minutes_played' column
        stat_cols: List of stat columns to normalize (e.g., 'points', 'rebounds')
    
    Returns:
        DataFrame with normalized stats (e.g., 'points_per_40')
    """
    df = df.copy()
    for col in stat_cols:
        df[f'{col}_per_40'] = (df[col] / df['minutes_played']) * 40
    return df
```

### Model Training Pattern
```python
import xgboost as xgb
from sklearn.model_selection import LeaveOneGroupOut
import shap

def train_success_model(X: pd.DataFrame, y: pd.Series, groups: pd.Series):
    """
    Train XGBoost model with leave-one-draft-out cross-validation.
    
    Args:
        X: Feature matrix
        y: Target variable (e.g., career_ws_per_48)
        groups: Draft year for each sample (for CV splitting)
    """
    logo = LeaveOneGroupOut()
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
    )
    
    # Cross-validate
    scores = []
    for train_idx, val_idx in logo.split(X, y, groups):
        model.fit(X.iloc[train_idx], y.iloc[train_idx])
        score = model.score(X.iloc[val_idx], y.iloc[val_idx])
        scores.append(score)
    
    # Train on all data for final model
    model.fit(X, y)
    
    # Compute SHAP values
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    
    return model, shap_values, np.mean(scores)
```

## Frontend Patterns

### Data Loading (Build Time)
**All data is loaded at build time via static imports. No runtime fetching.**

```typescript
// lib/data.ts
import prospectsData from '../../public/data/prospects.json'
import comparisonsData from '../../public/data/comparisons.json'
import metricImportanceData from '../../public/data/metric_importance.json'
import bigBoardData from '../../public/data/big_board.json'

import type { Prospect, Comparison, MetricImportance, BigBoardEntry } from './types'

export const getProspects = (): Prospect[] => {
  return prospectsData as Prospect[]
}

export const getProspectBySlug = (slug: string): Prospect | undefined => {
  return getProspects().find(p => p.slug === slug)
}

export const getComparisons = (prospectId: string): Comparison[] => {
  const comps = (comparisonsData as Record<string, Comparison[]>)[prospectId]
  if (!comps) {
    console.warn(`No comparisons found for prospect: ${prospectId}`)
    return []
  }
  return comps
}

export const getMetricImportance = (): MetricImportance[] => {
  return metricImportanceData as MetricImportance[]
}

export const getBigBoard = (): BigBoardEntry[] => {
  return bigBoardData as BigBoardEntry[]
}
```

### Page Structure (Next.js App Router)
```typescript
// app/prospect/[slug]/page.tsx
import { getProspectBySlug, getComparisons } from '@/lib/data'
import { notFound } from 'next/navigation'
import ProspectProfile from '@/components/prospect/ProspectProfile'

// Generate static paths at build time
export async function generateStaticParams() {
  const prospects = getProspects()
  return prospects.map(p => ({ slug: p.slug }))
}

// Server component — no client-side data fetching
export default function ProspectPage({ params }: { params: { slug: string } }) {
  const prospect = getProspectBySlug(params.slug)
  
  if (!prospect) {
    notFound()
  }
  
  const comparisons = getComparisons(prospect.id)
  
  return (
    <main>
      <ProspectProfile prospect={prospect} comparisons={comparisons} />
    </main>
  )
}
```

### Component Pattern
```typescript
// components/prospect/ProspectCard.tsx
import type { Prospect } from '@/lib/types'
import Link from 'next/link'

interface ProspectCardProps {
  prospect: Prospect
}

export default function ProspectCard({ prospect }: ProspectCardProps) {
  return (
    <Link 
      href={`/prospect/${prospect.slug}`}
      className="block p-4 bg-brand-800 rounded-lg hover:bg-brand-700 transition"
    >
      <h3 className="text-xl font-semibold text-brand-100">{prospect.name}</h3>
      <p className="text-brand-400">{prospect.position} • {prospect.school}</p>
      <div className="mt-2">
        <span className="text-sm text-brand-400">Predicted Percentile:</span>
        <span className="ml-2 font-bold text-accent">{prospect.predicted_percentile}</span>
      </div>
    </Link>
  )
}
```

### Client-Side Filtering Pattern
```typescript
// components/ProspectFilter.tsx
'use client'

import { useState } from 'react'
import type { Prospect } from '@/lib/types'
import ProspectCard from './ProspectCard'

interface ProspectFilterProps {
  prospects: Prospect[]
}

export default function ProspectFilter({ prospects }: ProspectFilterProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL')
  
  const filtered = selectedPosition === 'ALL' 
    ? prospects 
    : prospects.filter(p => p.position === selectedPosition)
  
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {['ALL', 'PG', 'SG', 'SF', 'PF', 'C'].map(pos => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(pos)}
            className={`px-4 py-2 rounded ${
              selectedPosition === pos 
                ? 'bg-accent text-white' 
                : 'bg-brand-700 text-brand-400'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prospect => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
      </div>
    </div>
  )
}
```

## State Management
- **Server state:** Not needed — all data is static
- **Client state:** React `useState` for filters/UI toggles only
- **Forms:** Not applicable for this project (read-only data display)
- **Rule:** Keep state minimal. Prefer server components over client components when possible.

## Error Handling

### Python
- Wrap all external API calls in try-except with proper logging
- Cache successful responses immediately
- Raise descriptive errors with context

### TypeScript
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe data access
- Log warnings for missing data but provide graceful fallbacks
- Never throw errors in render functions — return fallback UI instead

```typescript
export const getComparisons = (prospectId: string): Comparison[] => {
  const comps = comparisonsData[prospectId]
  if (!comps) {
    console.warn(`No comparisons found for prospect: ${prospectId}`)
    return [] // Graceful fallback
  }
  return comps
}
```

## Validation

### Python Pipeline
- Validate all JSON outputs against expected schemas before export
- Use type hints and runtime validation for all public functions
- Write tests for all feature engineering transformations

### Frontend
- Define strict TypeScript interfaces for all JSON data
- Use type assertions with validation (not blind casts)
- Validate environment variables at build time (if any)

## File and Naming Conventions
- **Python files:** snake_case (`feature_engineering.py`)
- **TypeScript files:** kebab-case (`prospect-card.tsx`, `metric-chart.tsx`)
- **React Components:** PascalCase (`ProspectCard`, `MetricChart`)
- **Functions/variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **TypeScript types/interfaces:** PascalCase

## Testing Pattern

### Python
- Unit tests for all feature engineering functions
- Model validity tests (rank correlation, calibration, no data leakage)
- JSON schema validation tests
- Run tests with: `pytest tests/ -v`

### Frontend
- TypeScript compilation must pass with zero errors
- ESLint must pass with zero errors
- Manual browser testing for UI/UX validation
- Lighthouse accessibility audit (target: 90+ score)

## Change Discipline
- **Plan before coding:** Propose approach before implementing
- **One feature at a time:** Complete and test each feature before moving to the next
- **No new dependencies without justification:** Check existing stack first
- **Never modify:** 
  - Cached raw data in `pipeline/data/raw/` (risk of rate limit violations)
  - GitHub Actions workflows without explicit approval
  - Design tokens without checking WCAG compliance
- **Always update MEMORY.md** after architectural decisions or major milestones

---

*For complete tech stack details, see `tech_stack.md`.*
*For product requirements, see `product_requirements.md`.*
