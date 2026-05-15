"""
SHAP (SHapley Additive exPlanations) analysis for model interpretability.

Generates:
1. Global feature importance rankings
2. Per-prospect SHAP value explanations
3. Feature contribution visualizations
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from pathlib import Path
import pickle
import json

try:
    import shap

    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("Warning: shap not installed. Install with: pip install shap")


def calculate_shap_values(
    model: Any, X: pd.DataFrame, background_samples: int = 100
) -> Tuple[Any, pd.DataFrame]:
    """
    Calculate SHAP values for model predictions.

    Args:
        model: Trained XGBoost model
        X: Feature matrix
        background_samples: Number of background samples for SHAP explainer

    Returns:
        Tuple of (shap_values, base_value)
    """
    if not SHAP_AVAILABLE:
        raise ImportError("shap is required for this function")

    print(f"\n{'='*80}")
    print("CALCULATING SHAP VALUES")
    print(f"{'='*80}")
    print(f"Samples: {len(X)}")
    print(f"Features: {len(X.columns)}")

    # Create SHAP explainer with background dataset
    # Use a subset for efficiency
    background = shap.sample(X, min(background_samples, len(X)))
    explainer = shap.TreeExplainer(model, background)

    # Calculate SHAP values
    shap_values = explainer.shap_values(X)

    # Get base value (expected value)
    base_value = explainer.expected_value

    print("✓ SHAP values calculated")
    print(f"  Base value (expected NBA_impact): {base_value:.2f}")

    return shap_values, base_value


def generate_global_feature_importance(
    shap_values: np.ndarray, feature_names: List[str], top_n: int = 20
) -> pd.DataFrame:
    """
    Generate global feature importance from SHAP values.

    Uses mean absolute SHAP value as importance metric.

    Args:
        shap_values: SHAP values array
        feature_names: List of feature names
        top_n: Number of top features to return

    Returns:
        DataFrame with feature importance rankings
    """
    # Calculate mean absolute SHAP value for each feature
    importance = np.abs(shap_values).mean(axis=0)

    # Create DataFrame
    importance_df = pd.DataFrame(
        {
            "feature": feature_names,
            "importance": importance,
            "importance_pct": importance / importance.sum() * 100,
        }
    ).sort_values("importance", ascending=False)

    print(f"\n{'='*80}")
    print(f"GLOBAL FEATURE IMPORTANCE (Top {top_n})")
    print(f"{'='*80}")

    for i, row in importance_df.head(top_n).iterrows():
        print(
            f"  {i+1}. {row['feature']}: {row['importance']:.4f} ({row['importance_pct']:.1f}%)"
        )

    return importance_df


def generate_prospect_explanations(
    shap_values: np.ndarray,
    X: pd.DataFrame,
    predictions: np.ndarray,
    base_value: float,
    prospect_names: pd.Series,
    top_n_features: int = 5,
) -> List[Dict]:
    """
    Generate SHAP explanations for each prospect.

    Args:
        shap_values: SHAP values array
        X: Feature matrix
        predictions: Model predictions
        base_value: SHAP base value (expected value)
        prospect_names: Series with prospect names
        top_n_features: Number of top contributing features to include

    Returns:
        List of dictionaries with prospect explanations
    """
    explanations = []

    for idx in range(len(X)):
        # Get SHAP values for this prospect
        prospect_shap = shap_values[idx]
        prospect_features = X.iloc[idx]

        # Get top positive and negative contributors
        contributions = pd.DataFrame(
            {
                "feature": X.columns,
                "shap_value": prospect_shap,
                "feature_value": prospect_features.values,
            }
        ).sort_values("shap_value", key=abs, ascending=False)

        # Build explanation
        explanation = {
            "name": prospect_names.iloc[idx],
            "predicted_impact": float(predictions[idx]),
            "base_value": float(base_value),
            "top_positive_factors": [],
            "top_negative_factors": [],
        }

        # Positive contributors (boost prediction)
        positive = contributions[contributions["shap_value"] > 0].head(top_n_features)
        for _, row in positive.iterrows():
            explanation["top_positive_factors"].append(
                {
                    "feature": row["feature"],
                    "contribution": float(row["shap_value"]),
                    "value": float(row["feature_value"]),
                }
            )

        # Negative contributors (lower prediction)
        negative = contributions[contributions["shap_value"] < 0].head(top_n_features)
        for _, row in negative.iterrows():
            explanation["top_negative_factors"].append(
                {
                    "feature": row["feature"],
                    "contribution": float(row["shap_value"]),
                    "value": float(row["feature_value"]),
                }
            )

        explanations.append(explanation)

    return explanations


def generate_readable_explanations(
    explanations: List[Dict], top_n_prospects: int = 10
) -> str:
    """
    Generate human-readable explanations for top prospects.

    Args:
        explanations: List of prospect explanations
        top_n_prospects: Number of top prospects to explain

    Returns:
        String with formatted explanations
    """
    # Sort by predicted impact
    sorted_explanations = sorted(
        explanations, key=lambda x: x["predicted_impact"], reverse=True
    )

    lines = []
    lines.append("\n" + "=" * 80)
    lines.append(f"TOP {top_n_prospects} PROSPECT EXPLANATIONS")
    lines.append("=" * 80)

    for i, exp in enumerate(sorted_explanations[:top_n_prospects], 1):
        lines.append(f"\n{i}. {exp['name']}")
        lines.append(f"   Predicted NBA Impact: {exp['predicted_impact']:.2f}")
        lines.append(f"   (Base expectation: {exp['base_value']:.2f})")

        if exp["top_positive_factors"]:
            lines.append("\n   Positive Factors (boost prediction):")
            for factor in exp["top_positive_factors"]:
                lines.append(
                    f"     • {factor['feature']}: +{factor['contribution']:.3f} "
                    f"(value: {factor['value']:.2f})"
                )

        if exp["top_negative_factors"]:
            lines.append("\n   Negative Factors (lower prediction):")
            for factor in exp["top_negative_factors"]:
                lines.append(
                    f"     • {factor['feature']}: {factor['contribution']:.3f} "
                    f"(value: {factor['value']:.2f})"
                )

    return "\n".join(lines)


def save_shap_analysis(
    feature_importance: pd.DataFrame,
    prospect_explanations: List[Dict],
    output_dir: Path,
):
    """
    Save SHAP analysis results.

    Args:
        feature_importance: Global feature importance DataFrame
        prospect_explanations: List of prospect explanations
        output_dir: Directory to save results
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save feature importance
    importance_path = output_dir / "feature_importance.json"
    importance_dict = feature_importance.to_dict(orient="records")
    with open(importance_path, "w") as f:
        json.dump(importance_dict, f, indent=2)
    print(f"\n✓ Feature importance saved to: {importance_path}")

    # Save prospect explanations
    explanations_path = output_dir / "prospect_explanations.json"
    with open(explanations_path, "w") as f:
        json.dump(prospect_explanations, f, indent=2)
    print(f"✓ Prospect explanations saved to: {explanations_path}")

    # Save readable summary
    readable = generate_readable_explanations(prospect_explanations, top_n_prospects=15)
    summary_path = output_dir / "shap_explanations_summary.txt"
    with open(summary_path, "w") as f:
        f.write(readable)
    print(f"✓ Readable summary saved to: {summary_path}")


if __name__ == "__main__":
    """Test SHAP analysis module."""
    if not SHAP_AVAILABLE:
        print("Error: shap not available. Install with: pip install shap")
        exit(1)

    print("Testing SHAP analysis module...")

    # Import dependencies
    import sys

    sys.path.insert(0, str(Path(__file__).parent.parent))
    from features.normalize import (
        reclassify_positions,
        normalize_per_40,
        winsorize_outliers,
        adjust_for_age,
        create_position_normalized_features,
        create_composite_features,
        get_default_feature_list,
    )

    # Load data
    data_path = (
        Path(__file__).parent.parent.parent.parent
        / "data/processed/enhanced_draft_data.csv"
    )
    df = pd.read_csv(data_path)

    # Reclassify positions to modern system (Guard/Wing/Big)
    df = reclassify_positions(df)
    print("✓ Positions reclassified to modern system (Guard/Wing/Big)")

    # Feature engineering
    counting_stats = ["pts", "ast", "oreb", "dreb", "stl", "blks", "tov"]
    df = normalize_per_40(df, counting_stats)

    # Cap outliers using winsorization (99th percentile)
    per_40_cols = [f"{s}_per_40" for s in counting_stats if f"{s}_per_40" in df.columns]
    print("\nCapping per-40 outliers...")
    df = winsorize_outliers(
        df, per_40_cols, lower_percentile=0.01, upper_percentile=0.99
    )

    df = adjust_for_age(df, per_40_cols)
    df = create_composite_features(df)  # Create composites first
    df = create_position_normalized_features(df)  # Then normalize by position

    # Get features
    feature_cols = get_default_feature_list(df)

    # Load trained model
    model_path = (
        Path(__file__).parent.parent.parent.parent / "data/models/success_model.pkl"
    )

    if not model_path.exists():
        print("\nError: Model not found. Run success.py first to train the model.")
        exit(1)

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    print(f"\n✓ Loaded model from: {model_path}")

    # Prepare 2026 prospects
    prospects_2026 = df[df["season"] == 2026].copy()
    X_prospects = prospects_2026[feature_cols].fillna(
        prospects_2026[feature_cols].median()
    )
    predictions = model.predict(X_prospects)

    # Calculate SHAP values
    shap_values, base_value = calculate_shap_values(model, X_prospects)

    # Generate global feature importance
    feature_importance = generate_global_feature_importance(shap_values, feature_cols)

    # Generate prospect explanations
    prospect_explanations = generate_prospect_explanations(
        shap_values, X_prospects, predictions, base_value, prospects_2026["name"]
    )

    # Print readable explanations
    readable = generate_readable_explanations(prospect_explanations, top_n_prospects=10)
    print(readable)

    # Save results
    output_dir = Path(__file__).parent.parent.parent.parent / "data/models"
    save_shap_analysis(feature_importance, prospect_explanations, output_dir)

    print("\n" + "=" * 80)
    print("✓ SHAP ANALYSIS MODULE TESTS PASSED")
    print("=" * 80)
