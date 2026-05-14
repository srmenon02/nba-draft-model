# Testing Strategy

## Overview
Testing for this project focuses on **model validity** and **output quality** over comprehensive unit test coverage. The goal is to ensure the ML pipeline produces defensible predictions and the frontend displays data correctly.

## Python Pipeline Tests

### Testing Framework
- **Tool:** pytest
- **Coverage:** Feature engineering, model validity, JSON output schemas
- **Run command:** `cd pipeline && pytest tests/ -v`

### Test Categories

#### 1. Feature Engineering Tests (`tests/test_features.py`)

**Purpose:** Validate data transformations produce expected ranges and handle edge cases.

**Tests:**
- Normalization produces values in expected ranges (e.g., per-40 stats > 0)
- No NaN values in feature matrix after engineering
- Age adjustment coefficients are monotonic (younger players weighted more)
- Competition adjustment multipliers are in valid range (0.8–1.2)
- Percentile ranks are correctly computed within draft class (0–100)

**Example:**
```python
def test_normalize_per_40():
    """Per-40 normalization should produce positive values."""
    df = pd.DataFrame({
        'points': [20, 15, 10],
        'minutes_played': [30, 25, 20]
    })
    result = normalize_per_40(df, ['points'])
    assert (result['points_per_40'] > 0).all()
    assert result['points_per_40'].iloc[0] == pytest.approx(26.67, rel=0.01)
```

#### 2. Similarity Engine Tests (`tests/test_similarity.py`)

**Purpose:** Validate player comparison logic produces reasonable outputs.

**Tests:**
- Similarity scores are in [0, 1] range
- Self-similarity = 1.0 (a player compared to themselves)
- Top comp for known player is a known reasonable comp (sanity check)
- No prospect returns itself as a comp (correctly filtered out)
- Similarity matrix is symmetric

**Example:**
```python
def test_similarity_scores_range():
    """All similarity scores should be between 0 and 1."""
    sim_matrix = build_similarity_matrix(historical_df, feature_cols)
    assert (sim_matrix >= 0).all().all()
    assert (sim_matrix <= 1).all().all()

def test_self_similarity():
    """A player compared to themselves should have similarity = 1.0."""
    sim_matrix = build_similarity_matrix(historical_df, feature_cols)
    assert np.allclose(np.diag(sim_matrix), 1.0)
```

#### 3. Model Validity Tests (`tests/test_model_validity.py`) — **CRITICAL**

**Purpose:** Ensure the ML model produces predictions that are actually predictive.

**Tests:**

**a) Rank Correlation Test**
```python
def test_rank_correlation():
    """
    Top-quartile predicted prospects should have significantly higher
    actual outcomes than bottom-quartile.
    
    Target: Spearman rho > 0.35 on holdout draft classes.
    """
    # Use leave-one-draft-out CV
    predictions, actuals = cross_validate_by_draft_class(model, X, y, draft_years)
    rho, p_value = spearmanr(predictions, actuals)
    
    assert rho > 0.35, f"Rank correlation {rho:.3f} below threshold"
    assert p_value < 0.05, "Correlation not statistically significant"
```

**b) Top Picks Calibration Test**
```python
def test_top_picks_calibration():
    """
    Prospects predicted in top 10 should have > 60% hit rate
    (defined as > 0.100 career WS/48) on holdout classes.
    """
    predictions = model.predict(X_test)
    top_10_idx = np.argsort(predictions)[-10:]
    hit_rate = (y_test.iloc[top_10_idx] > 0.100).mean()
    
    assert hit_rate > 0.60, f"Top-10 hit rate {hit_rate:.2%} below threshold"
```

**c) Data Leakage Test**
```python
def test_no_data_leakage():
    """
    Training data for draft class N should contain zero players
    drafted in class N.
    """
    for draft_year in draft_years:
        train_mask = (df['draft_year'] != draft_year)
        test_mask = (df['draft_year'] == draft_year)
        
        train_ids = set(df[train_mask]['player_id'])
        test_ids = set(df[test_mask]['player_id'])
        
        assert train_ids.isdisjoint(test_ids), f"Data leakage in {draft_year}"
```

**d) Face Validity Test (Manual)**
```python
def test_comp_face_validity():
    """
    Known prospects (e.g., LeBron, Zion) should return comps that
    pass the "eye test" as reasonable comparisons.
    """
    test_cases = {
        'lebron-james-2003': ['Magic Johnson', 'Scottie Pippen', 'Grant Hill'],
        'zion-williamson-2019': ['Blake Griffin', 'Shawn Kemp', 'Larry Johnson'],
    }
    
    for prospect_id, expected_comps in test_cases.items():
        actual_comps = get_top_comps(prospect_id, n=10)
        actual_names = [c['name'] for c in actual_comps]
        
        # At least one expected comp should be in top 10
        assert any(name in actual_names for name in expected_comps), \
            f"No expected comps for {prospect_id}: got {actual_names}"
```

#### 4. JSON Schema Tests (`tests/test_json_output.py`)

**Purpose:** Validate exported JSON files conform to expected structure.

**Tests:**
- All required JSON files exist (`prospects.json`, `comparisons.json`, etc.)
- All required keys present in each object
- Value types are correct (e.g., `similarity_score` is float)
- Value ranges are valid (e.g., percentiles 0–100)
- No missing/null values for required fields

**Example:**
```python
def test_prospects_json_schema():
    """Validate prospects.json structure."""
    with open('frontend/public/data/prospects.json') as f:
        prospects = json.load(f)
    
    assert isinstance(prospects, list)
    assert len(prospects) > 0
    
    for prospect in prospects:
        # Required keys
        assert 'id' in prospect
        assert 'name' in prospect
        assert 'position' in prospect
        assert 'predicted_percentile' in prospect
        
        # Value types
        assert isinstance(prospect['predicted_percentile'], (int, float))
        
        # Value ranges
        assert 0 <= prospect['predicted_percentile'] <= 100
```

#### 5. SHAP Feature Importance Test
```python
def test_metric_importance_coverage():
    """
    All features used in model should be present in metric_importance.json
    with non-zero SHAP values.
    """
    with open('frontend/public/data/metric_importance.json') as f:
        importance = json.load(f)
    
    importance_metrics = {m['metric'] for m in importance}
    model_features = set(model.feature_names_in_)
    
    assert model_features.issubset(importance_metrics), \
        f"Missing metrics in importance: {model_features - importance_metrics}"
```

## Frontend Tests

### Testing Framework
- **Primary:** TypeScript type checking + ESLint
- **Manual:** Browser testing for UI/UX
- **Accessibility:** Lighthouse audit

### Test Categories

#### 1. Type Safety
```bash
cd frontend
npx tsc --noEmit  # Must pass with zero errors
```

**Required:**
- All components have typed props
- No `any` types used
- JSON data correctly typed via interfaces

#### 2. Linting
```bash
cd frontend
npm run lint  # Must pass with zero errors
```

**ESLint rules enforced:**
- No unused variables
- No console.logs in production code (warnings allowed in dev)
- Consistent formatting (Prettier)

#### 3. Data Loading Tests (Manual)
- Verify `getProspects()` returns array with expected shape
- Verify `getProspectBySlug()` returns correct prospect
- Verify `getComparisons()` returns array (or empty array if missing)
- All pages build successfully: `npm run build` exits 0

#### 4. Browser Verification (Manual)

**Required checks before marking feature complete:**

**a) Desktop (1280px+)**
- All pages render without layout breaks
- Navigation works correctly
- Filtering/sorting functions as expected
- Charts display correctly
- Hover states work on interactive elements

**b) Mobile (375px)**
- All content readable without horizontal scroll
- Touch targets ≥ 44x44px
- Navigation accessible on mobile
- Charts scale appropriately

**c) Keyboard Navigation**
- All interactive elements reachable via Tab
- Focus indicators visible
- No keyboard traps

#### 5. Accessibility Audit

**Tool:** Lighthouse (Chrome DevTools)

**Run:**
1. Open app in Chrome
2. DevTools → Lighthouse tab
3. Select "Accessibility" + "Desktop"
4. Generate report

**Target:** Score ≥ 90

**Common issues to check:**
- [ ] Sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- [ ] All images have alt text
- [ ] Form inputs have labels (if applicable)
- [ ] ARIA labels for icon-only buttons
- [ ] Heading hierarchy (no skipped levels)
- [ ] Focus management (modals, dropdowns)

**Manual WCAG checks:**
- [ ] Text can be resized to 200% without loss of content
- [ ] No flashing/strobing content
- [ ] Page has descriptive title
- [ ] Landmarks used appropriately (header, nav, main, footer)

## Pre-Commit Hooks (Recommended)

**Setup:**
```bash
pip install pre-commit
pre-commit install
```

**`.pre-commit-config.yaml`** (Python)
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        args: [--line-length=100]
  
  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.0.270
    hooks:
      - id: ruff
```

**Frontend:** Use `husky` + `lint-staged` if desired (optional for MVP)

## Verification Loop

**After implementing each feature, verify:**
1. **Run tests:** `pytest tests/ -v` (Python) or `npm run lint` (TypeScript)
2. **Check types:** `tsc --noEmit` (if TypeScript)
3. **Manual verification:** Open browser, test the feature interactively
4. **Accessibility:** Spot-check contrast and keyboard navigation
5. **Update MEMORY.md:** Log any architectural decisions or known issues

**Do NOT mark a task complete until verification passes.**

## Definition of Technical Done

- [ ] Python pipeline runs end-to-end with no errors
- [ ] All `test_model_validity.py` tests pass
- [ ] Spearman rank correlation on holdout draft classes > 0.35
- [ ] All P0 JSON outputs present and schema-valid
- [ ] `next build` exits 0 with no TypeScript errors
- [ ] All pages render correctly on desktop (1280px) and mobile (375px)
- [ ] Lighthouse accessibility score ≥ 90
- [ ] WCAG 2.1 AA: zero critical violations in automated audit
- [ ] Live Vercel URL accessible without login

---

*For implementation patterns, see `code_patterns.md`.*
*For complete feature requirements, see `product_requirements.md`.*
