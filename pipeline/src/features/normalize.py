"""
Feature normalization and scaling for NBA Draft Model.

Handles:
1. Per-40-minute normalization for counting stats
2. Percentile ranking by position and draft class
3. Z-score standardization for ML models
4. Age adjustment for player development curves
5. Modern position classification (Guard/Wing/Big) based on height
"""

import pandas as pd
import numpy as np
from typing import List, Optional, Tuple
from pathlib import Path


def reclassify_positions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Reclassify traditional positions into modern role-based categories.
    
    Modern NBA positions based on size and traditional role:
    - Guard: PG and SG below 6'5" (77 inches)
    - Wing: SG 6'5"+, all SF, and PF up to 6'10" (82 inches)
    - Big: PF above 6'10" and all C
    
    Args:
        df: DataFrame with 'position' and 'height' columns
        
    Returns:
        DataFrame with reclassified positions
    """
    df = df.copy()
    
    if 'position' not in df.columns or 'height' not in df.columns:
        raise ValueError("DataFrame must contain 'position' and 'height' columns")
    
    def classify_position(row):
        pos = row['position']
        height = row['height']
        
        # Handle missing data
        if pd.isna(pos) or pd.isna(height):
            return pos
        
        # Guard: ALL PGs regardless of height, SG below 6'5" (77 inches)
        if pos == 'PG':
            return 'Guard'
        if pos == 'SG' and height < 77:
            return 'Guard'
        
        # Wing: SG 6'5"+, all SF, PF up to 6'10" (82 inches)
        if pos == 'SG' and height >= 77:
            return 'Wing'
        if pos == 'SF':
            return 'Wing'
        if pos == 'PF' and height <= 82:
            return 'Wing'
        
        # Big: PF above 6'10" (82 inches) and all C
        if pos == 'PF' and height > 82:
            return 'Big'
        if pos == 'C':
            return 'Big'
        
        # Fallback to original position if no rule matches
        return pos
    
    df['position'] = df.apply(classify_position, axis=1)
    
    return df


def normalize_per_40(df: pd.DataFrame, stat_cols: List[str]) -> pd.DataFrame:
    """
    Normalize counting stats to per-40-minute basis.
    
    Args:
        df: DataFrame with raw stats and 'mpg' column
        stat_cols: List of stat columns to normalize (e.g., 'pts', 'ast', 'reb')
    
    Returns:
        DataFrame with normalized stats as '{stat}_per_40' columns
    """
    df = df.copy()
    
    # Ensure mpg is available
    if 'mpg' not in df.columns:
        raise ValueError("DataFrame must contain 'mpg' (minutes per game) column")
    
    # Avoid division by zero
    valid_mpg = df['mpg'].fillna(0) > 0
    
    for stat in stat_cols:
        if stat not in df.columns:
            print(f"Warning: Column '{stat}' not found, skipping")
            continue
        
        # Calculate per-40 rate
        per_40_col = f"{stat}_per_40"
        df[per_40_col] = 0.0
        df.loc[valid_mpg, per_40_col] = (
            df.loc[valid_mpg, stat] / df.loc[valid_mpg, 'mpg'] * 40.0
        )
    
    return df


def calculate_percentiles_by_position(
    df: pd.DataFrame, 
    stat_cols: List[str],
    position_col: str = 'position'
) -> pd.DataFrame:
    """
    Calculate percentile rankings for each stat within position groups.
    
    Args:
        df: DataFrame with stats and position column
        stat_cols: List of stat columns to calculate percentiles for
        position_col: Name of position column
    
    Returns:
        DataFrame with percentile columns as '{stat}_pct_rank'
    """
    df = df.copy()
    
    if position_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{position_col}' column")
    
    for stat in stat_cols:
        if stat not in df.columns:
            print(f"Warning: Column '{stat}' not found, skipping")
            continue
        
        pct_col = f"{stat}_pct_rank"
        # Calculate percentile within each position group
        df[pct_col] = df.groupby(position_col)[stat].rank(pct=True)
    
    return df


def calculate_percentiles_by_year(
    df: pd.DataFrame,
    stat_cols: List[str],
    year_col: str = 'season'
) -> pd.DataFrame:
    """
    Calculate percentile rankings for each stat within draft class year.
    
    Args:
        df: DataFrame with stats and year column
        stat_cols: List of stat columns to calculate percentiles for
        year_col: Name of year/season column
    
    Returns:
        DataFrame with percentile columns as '{stat}_year_pct'
    """
    df = df.copy()
    
    if year_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{year_col}' column")
    
    for stat in stat_cols:
        if stat not in df.columns:
            print(f"Warning: Column '{stat}' not found, skipping")
            continue
        
        pct_col = f"{stat}_year_pct"
        # Calculate percentile within each draft year
        df[pct_col] = df.groupby(year_col)[stat].rank(pct=True)
    
    return df


def z_score_normalization(
    df: pd.DataFrame,
    stat_cols: List[str],
    by_position: bool = False,
    position_col: str = 'position'
) -> pd.DataFrame:
    """
    Apply z-score standardization to features (mean=0, std=1).
    
    Args:
        df: DataFrame with stats
        stat_cols: List of stat columns to normalize
        by_position: If True, normalize within each position group
        position_col: Name of position column (used if by_position=True)
    
    Returns:
        DataFrame with z-scored columns as '{stat}_z'
    """
    df = df.copy()
    
    if by_position and position_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{position_col}' column for position-based normalization")
    
    for stat in stat_cols:
        if stat not in df.columns:
            print(f"Warning: Column '{stat}' not found, skipping")
            continue
        
        z_col = f"{stat}_z"
        
        if by_position:
            # Z-score within each position group
            df[z_col] = df.groupby(position_col)[stat].transform(
                lambda x: (x - x.mean()) / x.std() if x.std() > 0 else 0
            )
        else:
            # Global z-score
            mean_val = df[stat].mean()
            std_val = df[stat].std()
            df[z_col] = (df[stat] - mean_val) / std_val if std_val > 0 else 0
    
    return df


def adjust_for_age(
    df: pd.DataFrame,
    stat_cols: List[str],
    age_col: str = 'age',
    reference_age: float = 19.5
) -> pd.DataFrame:
    """
    Adjust stats for player age using linear adjustment.
    
    Younger players get a positive boost, older players get a penalty.
    Standard reference age is 19.5 (typical freshman).
    
    Args:
        df: DataFrame with stats and age column
        stat_cols: List of stat columns to adjust
        age_col: Name of age column
        reference_age: Reference age for adjustment (typically 19.5)
    
    Returns:
        DataFrame with age-adjusted columns as '{stat}_age_adj'
    """
    df = df.copy()
    
    if age_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{age_col}' column")
    
    # Age adjustment factor: +0.1% boost per year younger than reference (minimal impact)
    # e.g., 18-year-old gets ~0.15% boost, 21-year-old gets ~0.15% penalty
    age_factor = 1 + (reference_age - df[age_col]) * 0.001
    
    for stat in stat_cols:
        if stat not in df.columns:
            print(f"Warning: Column '{stat}' not found, skipping")
            continue
        
        adj_col = f"{stat}_age_adj"
        df[adj_col] = df[stat] * age_factor
    
    return df


def create_composite_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create composite features combining multiple stats.
    
    Args:
        df: DataFrame with base stats
    
    Returns:
        DataFrame with composite feature columns added
    """
    df = df.copy()
    
    # Age scaling: Drastically reduce impact of age on model
    # Scale from ~18-24 to ~0.001-0.004 range (100x smaller than before)
    # This forces model to rely more on performance metrics rather than demographics
    if 'age' in df.columns:
        df['age_scaled'] = (df['age'] - 18.0) / 600.0  # Extreme scaling
    
    # Scoring efficiency composite
    if all(col in df.columns for col in ['ts_pct', 'fta', 'gp']):
        df['scoring_volume_efficiency'] = (
            df['ts_pct'] * np.log1p(df['fta'] / df['gp'].clip(lower=1))
        )
    
    # Playmaking composite (assists relative to turnovers and usage)
    if all(col in df.columns for col in ['ast', 'tov', 'gp']):
        df['playmaking_composite'] = (
            df['ast'] / df['gp'].clip(lower=1) / 
            (df['tov'] / df['gp'].clip(lower=1) + 1)
        )
    
    # Defensive impact composite
    if all(col in df.columns for col in ['stl', 'blks', 'gp']):
        df['defensive_composite'] = (
            (df['stl'] + df['blks'] * 1.2) / df['gp'].clip(lower=1)
        )
    
    # Rebounding rate (accounting for position/height)
    if all(col in df.columns for col in ['oreb', 'dreb', 'gp', 'height']):
        total_reb = df['oreb'] + df['dreb']
        reb_per_game = total_reb / df['gp'].clip(lower=1)
        # Adjust for height (taller players expected to rebound more)
        height_adjustment = 75 / df['height'].clip(lower=70)  # 75 inches as baseline
        df['rebounding_composite'] = reb_per_game * height_adjustment
    
    # Versatility score (can shoot, pass, and defend)
    if all(col in df.columns for col in ['three_pt_pct', 'ast_to_tov', 'stl', 'blks', 'gp']):
        df['versatility_score'] = (
            (df['three_pt_pct'].fillna(0) * 100) +  # Shooting
            (df['ast_to_tov'].fillna(0) * 10) +     # Playmaking
            ((df['stl'] + df['blks']) / df['gp'].clip(lower=1) * 5)  # Defense
        )
    
    return df


def prepare_features_for_ml(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: Optional[str] = 'NBA_impact',
    test_mask: Optional[pd.Series] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, Optional[pd.Series]]:
    """
    Prepare features and target for ML training.
    
    Args:
        df: DataFrame with all features
        feature_cols: List of feature columns to use for modeling
        target_col: Target variable column name
        test_mask: Boolean mask for test set (if None, uses players without NBA_impact)
    
    Returns:
        Tuple of (X_train, X_test, y_train, y_test)
        - X_train: Training features
        - X_test: Test features (2026 prospects)
        - y_train: Training target
        - y_test: Test target (None if not available)
    """
    # Remove rows with missing features
    valid_features = df[feature_cols].notna().all(axis=1)
    df_valid = df[valid_features].copy()
    
    if test_mask is None:
        # Default: test set is players without target variable
        test_mask = df_valid[target_col].isna()
    
    train_mask = ~test_mask & df_valid[target_col].notna()
    
    X_train = df_valid.loc[train_mask, feature_cols]
    X_test = df_valid.loc[test_mask, feature_cols]
    y_train = df_valid.loc[train_mask, target_col]
    y_test = df_valid.loc[test_mask, target_col] if target_col in df_valid.columns else None
    
    print(f"\n{'='*80}")
    print("ML DATASET PREPARATION")
    print(f"{'='*80}")
    print(f"Total features: {len(feature_cols)}")
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Target variable: {target_col}")
    print(f"Target range (train): [{y_train.min():.2f}, {y_train.max():.2f}]")
    
    return X_train, X_test, y_train, y_test


def get_default_feature_list(df: pd.DataFrame) -> List[str]:
    """
    Get default list of features for modeling.
    
    Args:
        df: DataFrame with all columns
    
    Returns:
        List of feature column names suitable for ML
    """
    # Base per-40 stats
    per_40_stats = [col for col in df.columns if col.endswith('_per_40')]
    
    # Efficiency metrics
    efficiency_cols = ['ts_pct', 'ft_pct', 'three_pt_pct', 'rim_pct', 'ast_to_tov']
    
    # Context features (age_scaled has reduced numerical range to limit dominance)
    context_cols = ['height', 'age_scaled', 'sos', 'team_strength', 'international']
    
    # Composite features
    composite_cols = [
        'scoring_volume_efficiency', 'playmaking_composite', 
        'defensive_composite', 'rebounding_composite', 'versatility_score'
    ]
    
    # Combine all available features
    feature_list = []
    for col in per_40_stats + efficiency_cols + context_cols + composite_cols:
        if col in df.columns:
            feature_list.append(col)
    
    return feature_list


if __name__ == "__main__":
    """Test normalization functions."""
    print("Testing feature normalization module...")
    
    # Load enhanced data
    data_path = Path(__file__).parent.parent.parent.parent / "data/processed/enhanced_draft_data.csv"
    df = pd.read_csv(data_path)
    
    print(f"\nLoaded {len(df)} players")
    
    # Test per-40 normalization
    counting_stats = ['pts', 'ast', 'oreb', 'dreb', 'stl', 'blks', 'tov']
    df = normalize_per_40(df, counting_stats)
    print(f"✓ Per-40 normalization complete ({len(counting_stats)} stats)")
    
    # Test age adjustment
    df = adjust_for_age(df, [f"{s}_per_40" for s in counting_stats if f"{s}_per_40" in df.columns])
    print("✓ Age adjustment complete")
    
    # Create composite features
    df = create_composite_features(df)
    print("✓ Composite features created")
    
    # Get feature list
    feature_list = get_default_feature_list(df)
    print(f"✓ Default feature list: {len(feature_list)} features")
    
    # Prepare for ML
    X_train, X_test, y_train, y_test = prepare_features_for_ml(df, feature_list)
    
    print("\n" + "="*80)
    print("✓ NORMALIZATION MODULE TESTS PASSED")
    print("="*80)
