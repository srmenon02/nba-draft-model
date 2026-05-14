"""
Data validation and quality checks for NBA Draft Model.

Handles:
1. Missing value detection and reporting
2. Outlier detection using IQR and z-score methods
3. Data consistency checks
4. Feature distribution analysis
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from pathlib import Path


def check_missing_values(
    df: pd.DataFrame, critical_cols: Optional[List[str]] = None
) -> Dict:
    """
    Analyze missing values in dataset.

    Args:
        df: DataFrame to check
        critical_cols: Columns that cannot have missing values

    Returns:
        Dictionary with missing value statistics
    """
    missing_stats = {
        "total_rows": len(df),
        "columns_with_missing": {},
        "critical_missing": [],
    }

    # Check each column
    for col in df.columns:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            missing_pct = missing_count / len(df) * 100
            missing_stats["columns_with_missing"][col] = {
                "count": int(missing_count),
                "percentage": round(missing_pct, 2),
            }

    # Check critical columns
    if critical_cols:
        for col in critical_cols:
            if col in df.columns and df[col].isna().any():
                missing_stats["critical_missing"].append(col)

    return missing_stats


def detect_outliers_iqr(
    df: pd.DataFrame, columns: List[str], multiplier: float = 1.5
) -> Dict[str, pd.Series]:
    """
    Detect outliers using Interquartile Range (IQR) method.

    Args:
        df: DataFrame to check
        columns: List of columns to check for outliers
        multiplier: IQR multiplier (1.5 = standard, 3.0 = extreme outliers)

    Returns:
        Dictionary mapping column names to boolean Series (True = outlier)
    """
    outliers = {}

    for col in columns:
        if col not in df.columns:
            continue

        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1

        lower_bound = Q1 - multiplier * IQR
        upper_bound = Q3 + multiplier * IQR

        outliers[col] = (df[col] < lower_bound) | (df[col] > upper_bound)

    return outliers


def detect_outliers_zscore(
    df: pd.DataFrame, columns: List[str], threshold: float = 3.0
) -> Dict[str, pd.Series]:
    """
    Detect outliers using z-score method.

    Args:
        df: DataFrame to check
        columns: List of columns to check for outliers
        threshold: Z-score threshold (typically 3.0 for outliers)

    Returns:
        Dictionary mapping column names to boolean Series (True = outlier)
    """
    outliers = {}

    for col in columns:
        if col not in df.columns:
            continue

        z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
        outliers[col] = z_scores > threshold

    return outliers


def check_data_consistency(df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Check for logical inconsistencies in data.

    Args:
        df: DataFrame to validate

    Returns:
        Dictionary of consistency issues found
    """
    issues = {
        "negative_values": [],
        "impossible_percentages": [],
        "age_issues": [],
        "height_issues": [],
        "playing_time_issues": [],
    }

    # Check for negative values in counting stats
    counting_stats = ["pts", "ast", "oreb", "dreb", "stl", "blks", "tov", "gp", "mpg"]
    for stat in counting_stats:
        if stat in df.columns and (df[stat] < 0).any():
            issues["negative_values"].append(
                f"{stat}: {(df[stat] < 0).sum()} negative values"
            )

    # Check percentage fields (should be 0-1 or 0-100 depending on convention)
    pct_fields = ["ts_pct", "ft_pct", "three_pt_pct", "rim_pct"]
    for pct in pct_fields:
        if pct in df.columns:
            # Allow some tolerance for floating point errors
            if (df[pct] < -0.01).any() or (df[pct] > 1.01).any():
                issues["impossible_percentages"].append(
                    f"{pct}: {((df[pct] < -0.01) | (df[pct] > 1.01)).sum()} out of range"
                )

    # Check age range (typical college players are 18-23)
    if "age" in df.columns:
        unusual_ages = (df["age"] < 17) | (df["age"] > 25)
        if unusual_ages.any():
            issues["age_issues"].append(f"Unusual ages: {unusual_ages.sum()} players")

    # Check height range (typical NBA players are 72-86 inches)
    if "height" in df.columns:
        unusual_heights = (df["height"] < 70) | (df["height"] > 88)
        if unusual_heights.any():
            issues["height_issues"].append(
                f"Unusual heights: {unusual_heights.sum()} players"
            )

    # Check minutes per game (should be <= 40)
    if "mpg" in df.columns:
        excessive_minutes = df["mpg"] > 42  # Allow some overtime
        if excessive_minutes.any():
            issues["playing_time_issues"].append(
                f"Excessive MPG (>42): {excessive_minutes.sum()} players"
            )

    return issues


def analyze_feature_distributions(
    df: pd.DataFrame, numeric_cols: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Generate summary statistics for numeric features.

    Args:
        df: DataFrame to analyze
        numeric_cols: List of numeric columns to analyze (None = all numeric)

    Returns:
        DataFrame with distribution statistics
    """
    if numeric_cols is None:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    stats = []
    for col in numeric_cols:
        if col not in df.columns:
            continue

        col_stats = {
            "feature": col,
            "count": df[col].notna().sum(),
            "missing": df[col].isna().sum(),
            "mean": df[col].mean(),
            "std": df[col].std(),
            "min": df[col].min(),
            "q25": df[col].quantile(0.25),
            "median": df[col].median(),
            "q75": df[col].quantile(0.75),
            "max": df[col].max(),
            "skew": df[col].skew(),
            "kurtosis": df[col].kurtosis(),
        }
        stats.append(col_stats)

    return pd.DataFrame(stats)


def validate_training_data(
    df: pd.DataFrame, feature_cols: List[str], target_col: str = "NBA_impact"
) -> Tuple[bool, List[str]]:
    """
    Validate that training data is ready for modeling.

    Args:
        df: DataFrame with features and target
        feature_cols: List of feature columns
        target_col: Target variable column

    Returns:
        Tuple of (is_valid, list of error messages)
    """
    errors = []

    # Check if all feature columns exist
    missing_features = [col for col in feature_cols if col not in df.columns]
    if missing_features:
        errors.append(f"Missing feature columns: {missing_features}")

    # Check if target column exists
    if target_col not in df.columns:
        errors.append(f"Missing target column: {target_col}")

    # Check for sufficient training samples
    if target_col in df.columns:
        training_samples = df[target_col].notna().sum()
        if training_samples < 100:
            errors.append(
                f"Insufficient training samples: {training_samples} (need at least 100)"
            )

    # Check for infinite values
    for col in feature_cols:
        if col in df.columns and np.isinf(df[col]).any():
            inf_count = np.isinf(df[col]).sum()
            errors.append(f"Infinite values in {col}: {inf_count}")

    # Check for extreme missing values in features
    for col in feature_cols:
        if col in df.columns:
            missing_pct = df[col].isna().sum() / len(df) * 100
            if missing_pct > 50:
                errors.append(f"High missing rate in {col}: {missing_pct:.1f}%")

    is_valid = len(errors) == 0
    return is_valid, errors


def generate_validation_report(
    df: pd.DataFrame, output_path: Optional[Path] = None
) -> str:
    """
    Generate comprehensive validation report.

    Args:
        df: DataFrame to validate
        output_path: Optional path to save report

    Returns:
        Report as string
    """
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("DATA VALIDATION REPORT")
    report_lines.append("=" * 80)
    report_lines.append(f"\nDataset: {len(df)} rows, {len(df.columns)} columns")

    # Missing values
    report_lines.append("\n" + "-" * 80)
    report_lines.append("MISSING VALUES")
    report_lines.append("-" * 80)
    missing_stats = check_missing_values(df)
    if missing_stats["columns_with_missing"]:
        for col, stats in missing_stats["columns_with_missing"].items():
            report_lines.append(
                f"  {col}: {stats['count']} missing ({stats['percentage']:.1f}%)"
            )
    else:
        report_lines.append("  ✓ No missing values")

    # Data consistency
    report_lines.append("\n" + "-" * 80)
    report_lines.append("DATA CONSISTENCY")
    report_lines.append("-" * 80)
    consistency_issues = check_data_consistency(df)
    has_issues = any(issues for issues in consistency_issues.values())

    if has_issues:
        for category, issues in consistency_issues.items():
            if issues:
                report_lines.append(f"\n{category.replace('_', ' ').title()}:")
                for issue in issues:
                    report_lines.append(f"  • {issue}")
    else:
        report_lines.append("  ✓ No consistency issues detected")

    # Outliers
    report_lines.append("\n" + "-" * 80)
    report_lines.append("OUTLIER DETECTION (IQR method)")
    report_lines.append("-" * 80)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    key_stats = [
        col
        for col in ["pts", "ast", "oreb", "dreb", "height", "age", "mpg"]
        if col in numeric_cols
    ]

    if key_stats:
        outliers = detect_outliers_iqr(df, key_stats)
        for col, is_outlier in outliers.items():
            outlier_count = is_outlier.sum()
            if outlier_count > 0:
                report_lines.append(f"  {col}: {outlier_count} outliers")

        if not any(is_outlier.sum() > 0 for is_outlier in outliers.values()):
            report_lines.append("  ✓ No significant outliers detected")

    # Summary statistics for key features
    report_lines.append("\n" + "-" * 80)
    report_lines.append("FEATURE DISTRIBUTIONS (Key Stats)")
    report_lines.append("-" * 80)

    if key_stats:
        dist_stats = analyze_feature_distributions(df, key_stats)
        for _, row in dist_stats.iterrows():
            report_lines.append(f"\n{row['feature']}:")
            report_lines.append(
                f"  Range: [{row['min']:.2f}, {row['max']:.2f}]  "
                f"Mean: {row['mean']:.2f}  Median: {row['median']:.2f}"
            )

    report_lines.append("\n" + "=" * 80)
    report_lines.append("END OF VALIDATION REPORT")
    report_lines.append("=" * 80)

    report_text = "\n".join(report_lines)

    # Save report if path provided
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report_text)
        print(f"\n✓ Validation report saved to: {output_path}")

    return report_text


if __name__ == "__main__":
    """Test validation functions."""
    print("Testing data validation module...")

    # Load enhanced data
    data_path = (
        Path(__file__).parent.parent.parent.parent
        / "data/processed/enhanced_draft_data.csv"
    )
    df = pd.read_csv(data_path)

    print(f"\nLoaded {len(df)} players")

    # Generate validation report
    report_path = (
        Path(__file__).parent.parent.parent.parent
        / "data/processed/validation_report.txt"
    )
    report = generate_validation_report(df, report_path)

    print(report)

    print("\n" + "=" * 80)
    print("✓ VALIDATION MODULE TESTS PASSED")
    print("=" * 80)
