"""
Comprehensive data collection script to supplement the base draft model data.

Collects:
1. NBA Draft Combine measurements (wingspan, weight, vertical, etc.)
2. Position data
3. Advanced college stats where available
"""

import sys
from pathlib import Path
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.ingest.load_csv import load_base_data
from src.ingest.supplemental_data import (
    NBAApiCollector,
    calculate_derived_metrics,
    calculate_physical_derived_metrics,
)
from src.features.normalize import reclassify_positions


def collect_combine_data(start_year: int = 2010, end_year: int = 2026) -> pd.DataFrame:
    """
    Collect NBA Draft Combine data for all years.

    Args:
        start_year: Starting draft year
        end_year: Ending draft year

    Returns:
        Combined DataFrame with all combine measurements
    """
    print("\n" + "=" * 80)
    print("COLLECTING NBA DRAFT COMBINE DATA")
    print("=" * 80)

    collector = NBAApiCollector()

    if not collector.available:
        print("\n✗ nba_api not available. Cannot collect combine data.")
        return pd.DataFrame()

    # Collect combine data for all years
    combine_df = collector.collect_combine_data_for_years(start_year, end_year)

    if len(combine_df) > 0:
        # Standardize column names
        combine_df = combine_df.rename(
            columns={
                "PLAYER_NAME": "name",
                "POSITION": "position",
                "HEIGHT_WO_SHOES": "height_wo_shoes",
                "HEIGHT_W_SHOES": "height_w_shoes",
                "WEIGHT": "weight",
                "WINGSPAN": "wingspan",
                "STANDING_REACH": "standing_reach",
                "STANDING_VERTICAL_LEAP": "vertical_standing",
                "MAX_VERTICAL_LEAP": "vertical_max",
                "LANE_AGILITY_TIME": "lane_agility",
                "THREE_QUARTER_SPRINT": "three_quarter_sprint",
                "BENCH_PRESS": "bench_press",
                "BODY_FAT_PCT": "body_fat_pct",
                "HAND_LENGTH": "hand_length",
                "HAND_WIDTH": "hand_width",
            }
        )

        print(
            f"\n✓ Collected combine data for {combine_df['draft_year'].nunique()} years"
        )
        print(f"✓ Total combine participants: {len(combine_df)}")
        print("\nSample data:")
        print(
            combine_df[
                ["name", "draft_year", "position", "wingspan", "vertical_max", "weight"]
            ].head()
        )

    return combine_df


def standardize_player_names(name: str) -> str:
    """
    Standardize player names for matching.

    Args:
        name: Raw player name

    Returns:
        Standardized name
    """
    # Remove extra whitespace, convert to title case
    name = " ".join(name.split()).strip()

    # Handle common suffixes
    suffixes = [" Jr.", " Jr", " Sr.", " Sr", " II", " III", " IV"]
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[: -len(suffix)].strip()

    return name


def merge_supplemental_data(
    base_df: pd.DataFrame, combine_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Merge supplemental data with base dataset.

    Args:
        base_df: Base draft model data
        combine_df: NBA combine measurements

    Returns:
        Merged DataFrame with supplemental features
    """
    print("\n" + "=" * 80)
    print("MERGING SUPPLEMENTAL DATA")
    print("=" * 80)

    # Standardize names in both datasets
    base_df["name_std"] = base_df["name"].apply(standardize_player_names)
    combine_df["name_std"] = combine_df["name"].apply(standardize_player_names)

    # Merge on standardized name and draft year
    merged = base_df.merge(
        combine_df[
            [
                "name_std",
                "draft_year",
                "position",
                "height_wo_shoes",
                "height_w_shoes",
                "weight",
                "wingspan",
                "standing_reach",
                "vertical_standing",
                "vertical_max",
                "lane_agility",
                "three_quarter_sprint",
                "bench_press",
                "body_fat_pct",
                "hand_length",
                "hand_width",
            ]
        ],
        left_on=["name_std", "season"],
        right_on=["name_std", "draft_year"],
        how="left",
        suffixes=("", "_combine"),
    )

    # Drop temporary columns
    merged = merged.drop(columns=["name_std", "draft_year"], errors="ignore")

    # Report merge stats
    total_base = len(base_df)
    matched = merged["wingspan"].notna().sum()
    match_rate = matched / total_base * 100

    print("\n✓ Merge complete")
    print(f"  Base dataset: {total_base} players")
    print(f"  Matched with combine data: {matched} players ({match_rate:.1f}%)")
    print("  New features added: position, wingspan, weight, vertical, etc.")

    # Show coverage by year
    coverage_by_year = merged.groupby("season").agg(
        {"name": "count", "wingspan": lambda x: x.notna().sum()}
    )
    coverage_by_year["match_rate"] = (
        coverage_by_year["wingspan"] / coverage_by_year["name"] * 100
    ).round(1)
    coverage_by_year.columns = ["total_players", "with_combine", "match_rate_%"]

    print("\nCoverage by year:")
    print(coverage_by_year.tail(10).to_string())

    return merged


def infer_positions_from_stats(df: pd.DataFrame) -> pd.DataFrame:
    """
    Infer positions for players without combine data using statistical clustering.

    Args:
        df: DataFrame with stats

    Returns:
        DataFrame with position filled where missing
    """
    print("\n" + "=" * 80)
    print("INFERRING MISSING POSITIONS FROM STATS")
    print("=" * 80)

    missing_position = df["position"].isna().sum()
    print(f"\nPlayers missing position data: {missing_position}")

    if missing_position == 0:
        print("✓ No position inference needed")
        return df

    # Simple rule-based inference based on height and playing style
    def infer_position(row):
        if pd.notna(row.get("position")):
            return row["position"]

        height = row.get("height", 75)
        ast_rate = row.get("ast", 0) / row.get("gp", 1)
        three_rate = row.get("3fgm", 0) / row.get("gp", 1)

        # Height-based primary assignment
        if height <= 74:  # 6'2" and under - prioritize playmaking
            return "PG" if ast_rate > 3.5 else "SG"
        elif height <= 78:  # 6'6" and under - use assists to distinguish PG from wings
            if ast_rate > 4.0:  # High assist rate = point guard
                return "PG"
            elif three_rate > 1.5:
                return "SG"
            else:
                return "SF"
        elif height <= 81:  # 6'9" and under
            return "SF" if three_rate > 1.0 else "PF"
        else:  # 6'10" and up
            return "PF" if three_rate > 0.5 or ast_rate > 2.0 else "C"

    df["position_inferred"] = df.apply(infer_position, axis=1)

    # Fill missing positions with inferred values
    df["position"] = df["position"].fillna(df["position_inferred"])

    inferred_count = (df["position"] == df["position_inferred"]).sum()
    print(f"✓ Inferred positions for {inferred_count} players")

    # Show distribution
    print("\nPosition distribution:")
    print(df["position"].value_counts().to_string())

    return df.drop(columns=["position_inferred"], errors="ignore")


def save_enhanced_dataset(
    df: pd.DataFrame, output_path: str = "data/processed/enhanced_draft_data.csv"
):
    """
    Save the enhanced dataset with supplemental features.

    Args:
        df: Enhanced DataFrame
        output_path: Output file path
    """
    base_dir = Path(__file__).parent.parent.parent
    full_path = base_dir / output_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(full_path, index=False)
    print(f"\n✓ Enhanced dataset saved to: {full_path}")
    print(f"  Total features: {len(df.columns)}")
    print(f"  Total players: {len(df)}")


def generate_feature_summary(df: pd.DataFrame):
    """
    Generate summary of available features.

    Args:
        df: DataFrame to summarize
    """
    print("\n" + "=" * 80)
    print("FEATURE SUMMARY")
    print("=" * 80)

    features = {
        "Base Stats": [
            "ftm",
            "fta",
            "3fgm",
            "3fga",
            "rim_made",
            "rim_miss",
            "pts",
            "ast",
            "oreb",
            "dreb",
            "stl",
            "blks",
        ],
        "Context": [
            "height",
            "age",
            "gp",
            "mpg",
            "sos",
            "team_strength",
            "international",
        ],
        "Combine Measurements": [
            "wingspan",
            "weight",
            "vertical_max",
            "standing_reach",
            "bench_press",
            "body_fat_pct",
            "hand_length",
            "hand_width",
        ],
        "Physical Derived Metrics": [
            "wingspan_to_height",
            "body_mass_index",
            "reach_advantage",
            "attended_combine",
        ],
        "Derived Metrics": [
            "ts_pct",
            "ft_pct",
            "three_pt_pct",
            "rim_pct",
            "ast_to_tov",
        ],
        "Outcomes": ["NBA_impact", "NBA_minutes", "NBA_seasons"],
    }

    for category, cols in features.items():
        available = [c for c in cols if c in df.columns]
        coverage = {
            col: f"{df[col].notna().sum()}/{len(df)} ({df[col].notna().sum()/len(df)*100:.1f}%)"
            for col in available
        }

        print(f"\n{category}:")
        for col, cov in coverage.items():
            print(f"  • {col}: {cov}")


def main():
    """Main data collection and merging pipeline."""
    print("\n🏀 NBA DRAFT MODEL - SUPPLEMENTAL DATA COLLECTION")
    print("=" * 80)

    try:
        # Load base data
        print("\n1. Loading base data...")
        base_df = load_base_data()

        # Calculate derived metrics
        print("\n2. Calculating derived metrics...")
        base_df = calculate_derived_metrics(base_df)
        print("✓ Calculated derived metrics")

        # Collect combine data
        print("\n3. Collecting NBA Draft Combine measurements...")
        combine_df = collect_combine_data(2010, 2026)

        # Merge supplemental data
        if len(combine_df) > 0:
            print("\n4. Merging supplemental data with base dataset...")
            enhanced_df = merge_supplemental_data(base_df, combine_df)

            # Calculate physical derived metrics from combine measurements
            print("\n5. Calculating physical derived metrics...")
            enhanced_df = calculate_physical_derived_metrics(enhanced_df)
            print(
                "✓ Calculated wingspan/height ratio, BMI, reach advantage, attended_combine flag"
            )
        else:
            print("\n4. No combine data available, using base dataset only")
            enhanced_df = base_df
            # Add position column if it doesn't exist
            if "position" not in enhanced_df.columns:
                enhanced_df["position"] = None

        # Infer missing positions
        print("\n6. Inferring missing position data...")
        enhanced_df = infer_positions_from_stats(enhanced_df)

        # Reclassify positions to modern system (Guard/Wing/Big)
        print("\n7. Reclassifying positions to modern system...")
        enhanced_df = reclassify_positions(enhanced_df)
        print("✓ Reclassified to Guard/Wing/Big system")

        # Save enhanced dataset
        print("\n8. Saving enhanced dataset...")
        save_enhanced_dataset(enhanced_df)

        # Generate feature summary
        generate_feature_summary(enhanced_df)

        print("\n" + "=" * 80)
        print("✓ DATA COLLECTION COMPLETE")
        print("=" * 80)
        print("\nNext steps:")
        print("1. Review enhanced_draft_data.csv")
        print("2. Build feature engineering pipeline")
        print("3. Train ML models (XGBoost + similarity)")
        print("4. Generate JSON exports for frontend")

    except Exception as e:
        print(f"\n✗ Error during data collection: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
