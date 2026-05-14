"""
Analyze per-40 statistics for outliers and propose cleanup strategies.

This script:
1. Loads the raw draft data
2. Calculates per-40 stats using the same method as the pipeline
3. Identifies outliers using statistical methods
4. Proposes cleanup/normalization strategies
"""

import pandas as pd
import numpy as np
from pathlib import Path


def calculate_per_40_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate per-40 statistics from raw counting stats."""
    df = df.copy()

    # Counting stats to normalize
    counting_stats = ["pts", "ast", "oreb", "dreb", "stl", "blks", "tov"]

    # Ensure mpg exists
    if "mpg" not in df.columns:
        print("ERROR: 'mpg' column not found")
        return df

    # Calculate per-40 for each counting stat
    valid_mpg = df["mpg"].fillna(0) > 0

    for stat in counting_stats:
        if stat not in df.columns:
            print(f"Warning: '{stat}' column not found, skipping")
            continue

        per_40_col = f"{stat}_per_40"
        df[per_40_col] = 0.0
        df.loc[valid_mpg, per_40_col] = (
            df.loc[valid_mpg, stat] / df.loc[valid_mpg, "mpg"] * 40.0
        )

    return df


def detect_outliers_iqr(series: pd.Series, multiplier: float = 3.0) -> pd.Series:
    """
    Detect outliers using IQR method.

    Args:
        series: Data series to analyze
        multiplier: IQR multiplier (1.5 = mild outliers, 3.0 = extreme outliers)

    Returns:
        Boolean series indicating outliers
    """
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - multiplier * IQR
    upper_bound = Q3 + multiplier * IQR
    return (series < lower_bound) | (series > upper_bound)


def detect_outliers_zscore(series: pd.Series, threshold: float = 4.0) -> pd.Series:
    """
    Detect outliers using Z-score method.

    Args:
        series: Data series to analyze
        threshold: Z-score threshold (4.0 = very extreme outliers)

    Returns:
        Boolean series indicating outliers
    """
    z_scores = np.abs((series - series.mean()) / series.std())
    return z_scores > threshold


def analyze_outliers(df: pd.DataFrame):
    """Comprehensive analysis of per-40 outliers."""
    print("\n" + "=" * 80)
    print("PER-40 STATISTICS OUTLIER ANALYSIS")
    print("=" * 80)

    per_40_cols = [col for col in df.columns if col.endswith("_per_40")]

    if not per_40_cols:
        print("ERROR: No per_40 columns found in DataFrame")
        return

    print(f"\nAnalyzing {len(per_40_cols)} per-40 statistics...")
    print(f"Total players: {len(df)}")

    # Identify players with very low games or minutes (likely cause of outliers)
    low_sample_size = (df["gp"] < 5) | (df["mpg"] < 5)
    print(
        f"\nPlayers with low sample size (GP < 5 or MPG < 5): {low_sample_size.sum()}"
    )

    outlier_summary = []

    for col in per_40_cols:
        stat_name = col.replace("_per_40", "").upper()

        print(f"\n{'-' * 80}")
        print(f"ANALYZING: {stat_name}/40")
        print(f"{'-' * 80}")

        # Basic statistics
        mean = df[col].mean()
        median = df[col].median()
        std = df[col].std()
        min_val = df[col].min()
        max_val = df[col].max()

        print(f"Mean: {mean:.2f}")
        print(f"Median: {median:.2f}")
        print(f"Std Dev: {std:.2f}")
        print(f"Min: {min_val:.2f}")
        print(f"Max: {max_val:.2f}")

        # Detect outliers using both methods
        outliers_iqr = detect_outliers_iqr(df[col], multiplier=3.0)
        outliers_zscore = detect_outliers_zscore(df[col], threshold=4.0)

        # Combined outliers (either method)
        outliers = outliers_iqr | outliers_zscore

        print(f"\nOutliers detected (IQR method): {outliers_iqr.sum()}")
        print(f"Outliers detected (Z-score method): {outliers_zscore.sum()}")
        print(f"Total unique outliers: {outliers.sum()}")

        # Show top 10 extreme values
        if outliers.sum() > 0:
            print("\nTop 10 extreme values:")
            extreme = df[outliers].nlargest(10, col)[
                ["name", col, "mpg", "gp", "season"]
            ]
            print(extreme.to_string(index=False))

            # Check correlation with low sample size
            low_sample_outliers = outliers & low_sample_size
            print(
                f"\nOutliers with low sample size: {low_sample_outliers.sum()} ({low_sample_outliers.sum() / outliers.sum() * 100:.1f}%)"
            )

        outlier_summary.append(
            {
                "stat": stat_name,
                "column": col,
                "mean": mean,
                "median": median,
                "std": std,
                "max": max_val,
                "outliers": outliers.sum(),
                "outliers_pct": outliers.sum() / len(df) * 100,
            }
        )

    # Summary table
    print(f"\n{'=' * 80}")
    print("OUTLIER SUMMARY")
    print(f"{'=' * 80}\n")

    summary_df = pd.DataFrame(outlier_summary)
    print(summary_df.to_string(index=False))

    # Recommendations
    print(f"\n{'=' * 80}")
    print("RECOMMENDATIONS")
    print(f"{'=' * 80}\n")

    print("1. MINIMUM SAMPLE SIZE FILTER:")
    print("   - Players with GP < 10 or MPG < 10 should be flagged")
    print(
        f"   - This would affect {((df['gp'] < 10) | (df['mpg'] < 10)).sum()} players"
    )

    print("\n2. WINSORIZATION (RECOMMENDED):")
    print("   - Cap extreme values at 95th or 99th percentile")
    print("   - Preserves data while limiting extreme outliers")
    print("   - Less aggressive than removing data")

    print("\n3. Z-SCORE CAPPING:")
    print("   - Cap values beyond ±4 standard deviations")
    print("   - More aggressive than winsorization")

    print("\n4. IQR-BASED CAPPING:")
    print("   - Cap values beyond Q3 + 3*IQR")
    print("   - Good for highly skewed distributions")

    return df, outlier_summary


def main():
    """Run the analysis."""
    # Load data
    data_path = (
        Path(__file__).parent.parent.parent
        / "data"
        / "processed"
        / "enhanced_draft_data.csv"
    )

    if not data_path.exists():
        print(f"ERROR: Data file not found at {data_path}")
        return

    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)

    print(f"Loaded {len(df)} players")
    print(f"Columns: {len(df.columns)}")

    # Calculate per-40 stats if not already present
    per_40_cols = [col for col in df.columns if col.endswith("_per_40")]

    if not per_40_cols:
        print("\nCalculating per-40 statistics...")
        df = calculate_per_40_stats(df)
    else:
        print(f"\nPer-40 statistics already present ({len(per_40_cols)} columns)")

    # Run analysis
    df_analyzed, summary = analyze_outliers(df)

    # Export analysis results
    output_path = (
        Path(__file__).parent.parent.parent
        / "data"
        / "processed"
        / "per40_outlier_analysis.csv"
    )

    # Create detailed outlier report
    per_40_cols = [col for col in df_analyzed.columns if col.endswith("_per_40")]
    outlier_report = df_analyzed[["name", "season", "mpg", "gp"] + per_40_cols].copy()
    outlier_report.to_csv(output_path, index=False)

    print(f"\n{'=' * 80}")
    print("Analysis complete! Detailed report saved to:")
    print(f"{output_path}")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    main()
