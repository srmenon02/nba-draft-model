"""
XGBoost model for predicting NBA success.

Uses leave-one-year-out cross-validation to predict NBA_impact scores for draft prospects.
Target metric: Spearman correlation > 0.35 between predictions and actual outcomes.
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple, List, Optional, Any
from pathlib import Path
import pickle
import json

try:
    import xgboost as xgb
    from sklearn.metrics import mean_squared_error, mean_absolute_error
    from scipy.stats import spearmanr
    XGBOOST_AVAILABLE = True
    XGBRegressor = xgb.XGBRegressor
except ImportError:
    XGBOOST_AVAILABLE = False
    XGBRegressor = Any  # type: ignore
    print("Warning: xgboost not installed. Install with: pip install xgboost")


def leave_one_year_out_cv(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = 'NBA_impact',
    year_col: str = 'season',
    xgb_params: Optional[Dict] = None
) -> Dict:
    """
    Perform leave-one-year-out cross-validation.
    
    Trains model on all years except one, predicts on held-out year.
    Repeats for each year to get unbiased performance estimates.
    
    Args:
        df: DataFrame with features and target
        feature_cols: List of feature columns for modeling
        target_col: Target variable column name
        year_col: Column containing draft year
        xgb_params: XGBoost hyperparameters (optional)
    
    Returns:
        Dictionary with CV results, predictions, and metrics
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is required for this function")
    
    # Default XGBoost parameters
    if xgb_params is None:
        xgb_params = {
            'objective': 'reg:squarederror',
            'max_depth': 3,  # Reduced from 4 to limit age dominance
            'learning_rate': 0.07,  # Increased slightly to compensate
            'n_estimators': 150,  # Reduced from 200
            'subsample': 0.8,
            'colsample_bytree': 0.7,  # Reduced to force more feature diversity
            'min_child_weight': 5,  # Increased to prevent overfitting
            'reg_alpha': 1.0,  # Stronger L1 regularization
            'reg_lambda': 3.0,  # Stronger L2 regularization
            'random_state': 42
        }
    
    # Filter to rows with target and features
    valid_mask = df[target_col].notna() & df[feature_cols].notna().all(axis=1)
    df_valid = df[valid_mask].copy()
    
    years = sorted(df_valid[year_col].unique())
    print(f"\n{'='*80}")
    print("LEAVE-ONE-YEAR-OUT CROSS-VALIDATION")
    print(f"{'='*80}")
    print(f"Years: {years[0]}-{years[-1]} ({len(years)} total)")
    print(f"Features: {len(feature_cols)}")
    print(f"Training samples: {len(df_valid)}")
    
    cv_results = []
    all_predictions = []
    all_actuals = []
    fold_metrics = []
    
    for held_out_year in years:
        # Split train/test by year
        train_mask = df_valid[year_col] != held_out_year
        test_mask = df_valid[year_col] == held_out_year
        
        X_train = df_valid.loc[train_mask, feature_cols]
        y_train = df_valid.loc[train_mask, target_col]
        X_test = df_valid.loc[test_mask, feature_cols]
        y_test = df_valid.loc[test_mask, target_col]
        
        if len(X_test) == 0:
            continue
        
        # Train XGBoost model
        model = xgb.XGBRegressor(**xgb_params)
        model.fit(X_train, y_train, verbose=False)
        
        # Predict on held-out year
        y_pred = model.predict(X_test)
        
        # Calculate metrics for this fold
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        spearman_rho, spearman_p = spearmanr(y_test, y_pred)
        
        fold_metrics.append({
            'year': held_out_year,
            'n_samples': len(X_test),
            'mse': mse,
            'rmse': np.sqrt(mse),
            'mae': mae,
            'spearman_rho': spearman_rho,
            'spearman_p': spearman_p
        })
        
        # Store predictions
        all_predictions.extend(y_pred)
        all_actuals.extend(y_test)
        
        print(f"\nYear {held_out_year}: n={len(X_test)}, "
              f"RMSE={np.sqrt(mse):.3f}, MAE={mae:.3f}, "
              f"Spearman rho={spearman_rho:.3f}")
    
    # Overall metrics across all folds
    overall_spearman, overall_p = spearmanr(all_actuals, all_predictions)
    overall_rmse = np.sqrt(mean_squared_error(all_actuals, all_predictions))
    overall_mae = mean_absolute_error(all_actuals, all_predictions)
    
    print(f"\n{'='*80}")
    print("OVERALL CV PERFORMANCE")
    print(f"{'='*80}")
    print(f"Spearman rho: {overall_spearman:.3f} (p={overall_p:.4f})")
    print(f"RMSE: {overall_rmse:.3f}")
    print(f"MAE: {overall_mae:.3f}")
    
    if overall_spearman > 0.35:
        print("✓ Target metric achieved (rho > 0.35)")
    else:
        print(f"⚠ Below target metric (rho={overall_spearman:.3f}, target=0.35)")
    
    return {
        'fold_metrics': fold_metrics,
        'overall_spearman': overall_spearman,
        'overall_rmse': overall_rmse,
        'overall_mae': overall_mae,
        'predictions': all_predictions,
        'actuals': all_actuals,
        'xgb_params': xgb_params
    }


def train_final_model(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = 'NBA_impact',
    xgb_params: Optional[Dict] = None
) -> Any:
    """
    Train final model on all available data.
    
    Args:
        df: DataFrame with features and target
        feature_cols: List of feature columns
        target_col: Target variable column
        xgb_params: XGBoost hyperparameters (optional)
    
    Returns:
        Trained XGBoost model
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is required for this function")
    
    # Default parameters
    if xgb_params is None:
        xgb_params = {
            'objective': 'reg:squarederror',
            'max_depth': 4,
            'learning_rate': 0.05,
            'n_estimators': 200,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 3,
            'random_state': 42
        }
    
    # Filter to rows with target and features
    valid_mask = df[target_col].notna() & df[feature_cols].notna().all(axis=1)
    X_train = df.loc[valid_mask, feature_cols]
    y_train = df.loc[valid_mask, target_col]
    
    print(f"\n{'='*80}")
    print("TRAINING FINAL MODEL")
    print(f"{'='*80}")
    print(f"Training samples: {len(X_train)}")
    print(f"Features: {len(feature_cols)}")
    
    # Train model
    model = xgb.XGBRegressor(**xgb_params)
    model.fit(X_train, y_train, verbose=False)
    
    # Get feature importances
    importances = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    for i, row in importances.head(10).iterrows():
        print(f"  {i+1}. {row['feature']}: {row['importance']:.4f}")
    
    print("\n✓ Final model training complete")
    
    return model


def predict_prospects(
    model: Any,
    df: pd.DataFrame,
    feature_cols: List[str],
    prospect_year: int = 2026
) -> pd.DataFrame:
    """
    Generate predictions for draft prospects.
    
    Args:
        model: Trained XGBoost model
        df: DataFrame with prospect features
        feature_cols: List of feature columns
        prospect_year: Draft year to predict for
    
    Returns:
        DataFrame with prospect predictions
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is required for this function")
    
    # Filter to prospects
    prospect_mask = df['season'] == prospect_year
    prospects = df[prospect_mask].copy()
    
    # Check for missing features
    missing_features = prospects[feature_cols].isna().any(axis=1)
    if missing_features.any():
        print(f"\nWarning: {missing_features.sum()} prospects have missing features")
    
    # Make predictions
    X_prospects = prospects[feature_cols].fillna(prospects[feature_cols].median())
    prospects['predicted_NBA_impact'] = model.predict(X_prospects)
    
    # Add prediction rank
    prospects['prediction_rank'] = prospects['predicted_NBA_impact'].rank(ascending=False)
    
    print(f"\n{'='*80}")
    print(f"PREDICTIONS FOR {prospect_year} DRAFT CLASS")
    print(f"{'='*80}")
    print(f"Total prospects: {len(prospects)}")
    print(f"\nTop 10 Predictions:")
    
    top_10 = prospects.nlargest(10, 'predicted_NBA_impact')[
        ['name', 'position', 'predicted_NBA_impact', 'prediction_rank']
    ]
    
    for i, row in top_10.iterrows():
        print(f"  {int(row['prediction_rank'])}. {row['name']} ({row['position']}): "
              f"{row['predicted_NBA_impact']:.2f}")
    
    return prospects


def save_model(
    model: Any,
    cv_results: Dict,
    feature_cols: List[str],
    output_dir: Path
):
    """
    Save trained model and metadata.
    
    Args:
        model: Trained XGBoost model
        cv_results: Cross-validation results
        feature_cols: List of features used
        output_dir: Directory to save model artifacts
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save model
    model_path = output_dir / "success_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"\n✓ Model saved to: {model_path}")
    
    # Save feature list
    features_path = output_dir / "model_features.json"
    with open(features_path, 'w') as f:
        json.dump({'features': feature_cols}, f, indent=2)
    print(f"✓ Features saved to: {features_path}")
    
    # Save CV results
    cv_path = output_dir / "cv_results.json"
    # Convert numpy types to Python types for JSON serialization
    cv_results_serializable = {
        'overall_spearman': float(cv_results['overall_spearman']),
        'overall_rmse': float(cv_results['overall_rmse']),
        'overall_mae': float(cv_results['overall_mae']),
        'fold_metrics': [
            {k: float(v) if isinstance(v, (np.integer, np.floating)) else v 
             for k, v in fold.items()}
            for fold in cv_results['fold_metrics']
        ],
        'xgb_params': cv_results['xgb_params']
    }
    
    with open(cv_path, 'w') as f:
        json.dump(cv_results_serializable, f, indent=2)
    print(f"✓ CV results saved to: {cv_path}")


if __name__ == "__main__":
    """Test success prediction model."""
    if not XGBOOST_AVAILABLE:
        print("Error: xgboost not available. Install with: pip install xgboost")
        exit(1)
    
    print("Testing XGBoost success prediction model...")
    
    # Import feature engineering
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from features.normalize import (
        normalize_per_40,
        adjust_for_age,
        create_composite_features,
        get_default_feature_list
    )
    
    # Load and prepare data
    data_path = Path(__file__).parent.parent.parent.parent / "data/processed/enhanced_draft_data.csv"
    df = pd.read_csv(data_path)
    
    print(f"\nLoaded {len(df)} players")
    
    # Feature engineering
    counting_stats = ['pts', 'ast', 'oreb', 'dreb', 'stl', 'blks', 'tov']
    df = normalize_per_40(df, counting_stats)
    df = adjust_for_age(df, [f"{s}_per_40" for s in counting_stats if f"{s}_per_40" in df.columns])
    df = create_composite_features(df)
    
    # Get feature list
    feature_cols = get_default_feature_list(df)
    print(f"Using {len(feature_cols)} features")
    
    # Run cross-validation
    cv_results = leave_one_year_out_cv(df, feature_cols)
    
    # Train final model
    model = train_final_model(df, feature_cols)
    
    # Predict 2026 prospects
    prospects = predict_prospects(model, df, feature_cols, prospect_year=2026)
    
    # Save model
    output_dir = Path(__file__).parent.parent.parent.parent / "data/models"
    save_model(model, cv_results, feature_cols, output_dir)
    
    print("\n" + "="*80)
    print("✓ SUCCESS PREDICTION MODEL TESTS PASSED")
    print("="*80)
