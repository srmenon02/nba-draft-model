"""
Comprehensive data analysis script for NBA Draft Model.

Analyzes existing data, identifies gaps, and collects supplemental information.
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingest.load_csv import load_base_data, get_data_summary
from ingest.supplemental_data import calculate_derived_metrics


def analyze_data_quality(df: pd.DataFrame) -> dict:
    """
    Analyze data quality and completeness.

    Args:
        df: Input DataFrame

    Returns:
        Dictionary with data quality metrics
    """
    quality = {
        "total_rows": len(df),
        "duplicate_names": df.duplicated(subset=["name", "season"]).sum(),
        "missing_by_column": df.isnull().sum().to_dict(),
        "zero_values": (df.select_dtypes(include=[np.number]) == 0).sum().to_dict(),
    }

    # Calculate completeness percentage per column
    completeness = {}
    for col in df.columns:
        non_null = df[col].notna().sum()
        completeness[col] = f"{(non_null / len(df) * 100):.1f}%"
    quality["completeness"] = completeness

    return quality


def analyze_feature_distributions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze distributions of key features.

    Args:
        df: Input DataFrame

    Returns:
        DataFrame with summary statistics
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    stats = df[numeric_cols].describe().T

    # Add additional metrics
    stats["missing"] = df[numeric_cols].isnull().sum()
    stats["missing_pct"] = (stats["missing"] / len(df) * 100).round(1)

    return stats


def identify_data_gaps(df: pd.DataFrame) -> dict:
    """
    Identify gaps and opportunities for supplemental data collection.

    Args:
        df: Input DataFrame

    Returns:
        Dictionary with identified gaps
    """
    gaps = {
        "missing_features": [],
        "high_missing_rate_features": [],
        "recommended_supplements": [],
    }

    # Check for missing features that would be valuable
    valuable_features = {
        "wingspan": "Wingspan (important for defensive projection)",
        "weight": "Weight (body composition matters)",
        "vertical_leap": "Vertical leap (athleticism metric)",
        "standing_reach": "Standing reach (important for rebounding/defense)",
        "position": "Position (essential for player comparisons)",
        "usage_rate": "Usage Rate (advanced metric)",
        "per": "Player Efficiency Rating",
        "bpm": "Box Plus/Minus",
        "dbpm": "Defensive Box Plus/Minus",
    }

    for feature, description in valuable_features.items():
        if feature not in df.columns:
            gaps["missing_features"].append(
                {"feature": feature, "description": description, "priority": "HIGH"}
            )

    # Check for features with high missing rates
    for col in df.columns:
        missing_rate = df[col].isnull().sum() / len(df)
        if missing_rate > 0.2:  # More than 20% missing
            gaps["high_missing_rate_features"].append(
                {"feature": col, "missing_rate": f"{missing_rate*100:.1f}%"}
            )

    # Recommendations
    gaps["recommended_supplements"] = [
        "NBA Draft Combine measurements (wingspan, weight, vertical, etc.)",
        "Position information for all players",
        "Advanced metrics (Usage Rate, PER, BPM) from college stats",
        "Defensive metrics where available",
        "Conference information for context adjustment",
    ]

    return gaps


def analyze_by_draft_year(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze data coverage by draft year.

    Args:
        df: Input DataFrame

    Returns:
        DataFrame with yearly statistics
    """
    yearly = (
        df.groupby("season")
        .agg(
            {
                "name": "count",
                "NBA_impact": ["mean", "std", lambda x: x.notna().sum()],
                "international": "sum",
                "height": "mean",
                "age": "mean",
            }
        )
        .round(2)
    )

    yearly.columns = [
        "players",
        "nba_impact_mean",
        "nba_impact_std",
        "with_outcomes",
        "international",
        "avg_height",
        "avg_age",
    ]

    return yearly


def analyze_correlations(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze correlations with NBA_impact.

    Args:
        df: Input DataFrame with NBA_impact

    Returns:
        DataFrame with correlation coefficients
    """
    # Only use training data (with NBA_impact)
    train_df = df[df["NBA_impact"].notna()].copy()

    if len(train_df) == 0:
        return pd.DataFrame()

    # Select numeric columns
    numeric_cols = train_df.select_dtypes(include=[np.number]).columns
    correlations = (
        train_df[numeric_cols]
        .corrwith(train_df["NBA_impact"])
        .sort_values(ascending=False)
    )

    corr_df = pd.DataFrame(
        {"feature": correlations.index, "correlation": correlations.values}
    )

    # Filter out NBA_impact itself and related outcome variables
    outcome_cols = ["NBA_impact", "NBA_minutes", "NBA_seasons", "standard_error"]
    corr_df = corr_df[~corr_df["feature"].isin(outcome_cols)]

    return corr_df


def generate_report(df: pd.DataFrame) -> str:
    """
    Generate comprehensive analysis report.

    Args:
        df: Input DataFrame

    Returns:
        Formatted report string
    """
    report = []
    report.append("=" * 80)
    report.append("NBA DRAFT MODEL - DATA ANALYSIS REPORT")
    report.append("=" * 80)

    # Summary
    summary = get_data_summary(df)
    report.append("\n📊 DATASET SUMMARY")
    report.append("-" * 80)
    report.append(f"Total Players: {summary['total_players']}")
    report.append(f"Seasons Covered: {summary['seasons']}")
    report.append(f"Players with NBA Outcomes: {summary['players_with_outcomes']}")
    report.append(f"2026 Prospects (need predictions): {summary['prospects_2026']}")
    report.append(f"International Players: {summary['international_players']}")

    # Feature analysis
    report.append("\n📈 FEATURE STATISTICS")
    report.append("-" * 80)
    stats = analyze_feature_distributions(df)
    report.append(f"\nKey metrics (from {len(stats)} total features):")
    report.append(
        stats[["mean", "std", "min", "max", "missing_pct"]].head(10).to_string()
    )

    # Data gaps
    report.append("\n🔍 IDENTIFIED DATA GAPS")
    report.append("-" * 80)
    gaps = identify_data_gaps(df)

    if gaps["missing_features"]:
        report.append("\nMissing Features (HIGH PRIORITY):")
        for item in gaps["missing_features"][:5]:
            report.append(f"  • {item['feature']}: {item['description']}")

    if gaps["high_missing_rate_features"]:
        report.append("\nFeatures with High Missing Rate (>20%):")
        for item in gaps["high_missing_rate_features"][:5]:
            report.append(f"  • {item['feature']}: {item['missing_rate']} missing")

    # Correlations with NBA impact
    train_df = df[df["NBA_impact"].notna()]
    if len(train_df) > 0:
        report.append("\n🎯 TOP FEATURES CORRELATED WITH NBA SUCCESS")
        report.append("-" * 80)
        corr_df = analyze_correlations(df)
        if len(corr_df) > 0:
            top_10 = corr_df.head(10)
            report.append("\nStrongest Positive Correlations:")
            for _, row in top_10.iterrows():
                report.append(f"  • {row['feature']}: {row['correlation']:.3f}")

            bottom_10 = corr_df.tail(10)
            report.append("\nStrongest Negative Correlations:")
            for _, row in bottom_10.iterrows():
                report.append(f"  • {row['feature']}: {row['correlation']:.3f}")

    # Yearly trends
    report.append("\n📅 DATA COVERAGE BY YEAR")
    report.append("-" * 80)
    yearly = analyze_by_draft_year(df)
    report.append(yearly.to_string())

    # Recommendations
    report.append("\n💡 RECOMMENDATIONS FOR SUPPLEMENTAL DATA COLLECTION")
    report.append("-" * 80)
    for i, rec in enumerate(gaps["recommended_supplements"], 1):
        report.append(f"{i}. {rec}")

    # 2026 Prospects
    prospects_2026 = df[df["season"] == 2026].copy()
    if len(prospects_2026) > 0:
        report.append("\n🏀 2026 DRAFT PROSPECTS (PREDICTION TARGETS)")
        report.append("-" * 80)
        prospect_cols = (
            ["name", "pick", "height", "age", "pts", "ast", "reb"]
            if "reb" in prospects_2026.columns
            else ["name", "pick", "height", "age"]
        )
        available_cols = [col for col in prospect_cols if col in prospects_2026.columns]
        report.append(prospects_2026[available_cols].head(15).to_string(index=False))
        if len(prospects_2026) > 15:
            report.append(f"... and {len(prospects_2026) - 15} more prospects")

    report.append("\n" + "=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)

    return "\n".join(report)


def main():
    """Main analysis pipeline."""
    print("Loading data...\n")

    try:
        # Load base data
        df = load_base_data()

        # Calculate derived metrics
        print("\nCalculating derived metrics...")
        df = calculate_derived_metrics(df)
        print(f"✓ Added {len(df.columns)} features (including derived metrics)")

        # Generate and print report
        report = generate_report(df)
        print(report)

        # Save report to file
        output_path = (
            Path(__file__).parent.parent.parent
            / "data"
            / "processed"
            / "data_analysis_report.txt"
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report)
        print(f"\n✓ Report saved to: {output_path}")

    except Exception as e:
        print(f"\n✗ Error during analysis: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
