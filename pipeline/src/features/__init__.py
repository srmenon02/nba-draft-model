"""Feature engineering package for NBA Draft Model."""

from .normalize import (
    reclassify_positions,
    normalize_per_40,
    winsorize_outliers,
    calculate_percentiles_by_position,
    calculate_percentiles_by_year,
    z_score_normalization,
    adjust_for_age,
    create_composite_features,
    prepare_features_for_ml,
    get_default_feature_list,
)

from .validation import (
    check_missing_values,
    detect_outliers_iqr,
    detect_outliers_zscore,
    check_data_consistency,
    analyze_feature_distributions,
    validate_training_data,
    generate_validation_report,
)

__all__ = [
    # Normalization functions
    "reclassify_positions",
    "normalize_per_40",
    "winsorize_outliers",
    "calculate_percentiles_by_position",
    "calculate_percentiles_by_year",
    "z_score_normalization",
    "adjust_for_age",
    "create_composite_features",
    "prepare_features_for_ml",
    "get_default_feature_list",
    # Validation functions
    "check_missing_values",
    "detect_outliers_iqr",
    "detect_outliers_zscore",
    "check_data_consistency",
    "analyze_feature_distributions",
    "validate_training_data",
    "generate_validation_report",
]
