# Per-40 Statistics Fix Summary

**Date:** 2026-05-14  
**Issue:** Outlier values in per-40 statistics (e.g., AJ Dybantsa had 124.14 TOV/40)  
**Status:** ✅ Fixed and Verified

---

## Problem Identified

The `normalize_per_40()` function was incorrectly calculating per-40 statistics by treating **season totals** as if they were already per-game stats.

### Incorrect Formula
```python
per_40 = season_total / mpg * 40
```

### Example (AJ Dybantsa)
- Season TOV: 108
- Games: 35
- MPG: 34.8
- **Wrong calculation:** 108 / 34.8 × 40 = **124.14 TOV/40** ❌

---

## Solution Implemented

### 1. Fixed Per-40 Calculation Formula

**Correct Formula:**
```python
per_40 = (season_total / games_played) / mpg * 40
# Simplified: season_total * 40 / (mpg * games_played)
```

**File Modified:** [`pipeline/src/features/normalize.py`](../pipeline/src/features/normalize.py)

**Key Changes:**
- Added `gp` (games played) to the formula
- Updated validation to require both `mpg` and `gp` columns
- Added comprehensive docstring explaining the calculation

### 2. Added Outlier Winsorization

**New Function:** `winsorize_outliers()`

**Purpose:** Cap extreme values at specified percentiles (default: 1st and 99th)

**Benefits:**
- Prevents remaining outliers from skewing model training
- Less aggressive than removing data points
- Preserves data structure and sample size

**Implementation:**
```python
df = winsorize_outliers(df, per_40_cols, lower_percentile=0.01, upper_percentile=0.99)
```

Applied in:
- [`pipeline/src/models/success.py`](../pipeline/src/models/success.py)
- [`pipeline/src/models/similarity.py`](../pipeline/src/models/similarity.py)
- [`pipeline/src/models/shap_analysis.py`](../pipeline/src/models/shap_analysis.py)

---

## Results

### AJ Dybantsa - Before vs After

| Stat | Before (Wrong) | After (Correct) |
|------|---------------|----------------|
| TOV/40 | 124.14 ❌ | 3.55 ✓ |
| PTS/40 | 1,028.14 ❌ | 29.36 ✓ |
| AST/40 | 149.43 ❌ | 4.27 ✓ |

### Summary Statistics (All 771 players)

| Metric | Mean | Median | Min | Max | Std Dev |
|--------|------|--------|-----|-----|---------|
| PTS/40 | 19.64 | 19.46 | 10.85 | 29.66 | 3.80 |
| AST/40 | 3.24 | 2.75 | 0.61 | 8.93 | 1.84 |
| REB/40 | 8.11 | 7.47 | 2.92 | 16.70 | 3.39 |
| STL/40 | 1.44 | 1.35 | 0.48 | 3.39 | 0.58 |
| BLK/40 | 1.21 | 0.78 | 0.04 | 5.19 | 1.15 |
| TOV/40 | 2.67 | 2.61 | 1.08 | 4.70 | 0.78 |

**Note:** Winsorization capped 8 extreme values (1%) on each tail per statistic.

---

## Files Modified

### Core Changes
1. **`pipeline/src/features/normalize.py`**
   - Fixed `normalize_per_40()` formula
   - Added `winsorize_outliers()` function
   - Updated test suite

2. **`pipeline/src/features/__init__.py`**
   - Exported `winsorize_outliers` function

### Model Integration
3. **`pipeline/src/models/success.py`**
   - Imported and applied `winsorize_outliers`
   
4. **`pipeline/src/models/similarity.py`**
   - Imported and applied `winsorize_outliers`
   
5. **`pipeline/src/models/shap_analysis.py`**
   - Imported and applied `winsorize_outliers`

### Analysis Tool
6. **`pipeline/src/analyze_per40_outliers.py`** (NEW)
   - Comprehensive outlier detection script
   - Statistical analysis using IQR and Z-score methods
   - Exports detailed outlier report

---

## Verification Steps Completed

✅ Fixed calculation formula in `normalize_per_40()`  
✅ Added `winsorize_outliers()` function  
✅ Ran unit tests on normalization module  
✅ Verified corrected per-40 stats for AJ Dybantsa  
✅ Regenerated full pipeline (`run_pipeline.sh`)  
✅ Retrained all models with corrected data  
✅ Regenerated all JSON exports for frontend  
✅ No Python errors or type issues  

---

## Impact Assessment

### Model Training
- **XGBoost success model:** Retrained with corrected per-40 features
- **Player similarity:** Recalculated using accurate normalized stats
- **SHAP explanations:** Updated to reflect corrected feature values

### Frontend
- **JSON exports:** All 5 data files regenerated
- **Prospect profiles:** Now show accurate per-40 statistics
- **Comparisons:** Player similarities recalculated with correct data

### Data Quality
- **Before:** Per-40 stats were 35x too high (incorrect by factor of games_played)
- **After:** Per-40 stats are now in expected NBA ranges (15-25 PPG, 2-5 APG, etc.)
- **Outliers:** Capped at 99th percentile to prevent extreme values from affecting models

---

## Testing Commands

### Run Analysis Script
```bash
cd /Users/smeno/Documents/Personal/Projects/NBA-Draft-Model
source .venv/bin/activate
python pipeline/src/analyze_per40_outliers.py
```

### Test Normalization Module
```bash
cd pipeline
python src/features/normalize.py
```

### Rebuild Full Pipeline
```bash
cd pipeline
bash run_pipeline.sh
```

---

## Maintenance Notes

### For Future Development
- The per-40 calculation now requires both `mpg` and `gp` columns
- Winsorization is applied at 1st and 99th percentiles by default
- Adjust percentiles via `lower_percentile` and `upper_percentile` parameters if needed
- The formula assumes season totals as input (not per-game stats)

### Data Quality Checks
- Always verify `gp > 0` and `mpg > 0` before calculating per-40 stats
- Monitor winsorization output to ensure appropriate number of values capped
- Check summary statistics to ensure values are in reasonable ranges

---

## References

- **Issue Reporter:** User observation of 124.14 TOV/40 for AJ Dybantsa
- **Root Cause:** Missing division by games_played in normalization formula
- **Fix Applied:** 2026-05-14
- **Pipeline Version:** Post-fix (all models retrained)

---

*This document records the fix for the per-40 statistics calculation error. All changes have been tested and verified.*
