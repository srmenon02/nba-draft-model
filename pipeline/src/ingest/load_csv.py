"""Load and validate the base draft model CSV data."""

import pandas as pd
from pathlib import Path
from typing import Tuple


def load_base_data(csv_path: str = "../data/draft-model-data.csv") -> pd.DataFrame:
    """
    Load the base draft model CSV data.

    Args:
        csv_path: Path to the draft-model-data.csv file

    Returns:
        DataFrame with loaded data
    """
    base_dir = Path(__file__).parent.parent.parent
    full_path = base_dir / csv_path

    print(f"Loading data from: {full_path}")
    df = pd.read_csv(full_path)

    print(
        f"Loaded {len(df)} players from seasons {df['season'].min()}-{df['season'].max()}"
    )
    print(f"Players with NBA outcomes: {df['NBA_impact'].notna().sum()}")
    print(f"2026 prospects (predictions needed): {(df['season'] == 2026).sum()}")

    return df


def split_train_test(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data into training (historical with NBA outcomes) and test (2026 prospects).

    Args:
        df: Full dataset

    Returns:
        Tuple of (training_df, test_df)
    """
    # Training: all players with NBA_impact data (historical)
    train_df = df[df["NBA_impact"].notna()].copy()

    # Test: 2026 prospects without NBA outcomes yet
    test_df = df[(df["season"] == 2026) & (df["NBA_impact"].isna())].copy()

    print(
        f"\nTraining set: {len(train_df)} players (seasons {train_df['season'].min()}-{train_df['season'].max()})"
    )
    print(f"Test set: {len(test_df)} 2026 prospects")

    return train_df, test_df


def get_data_summary(df: pd.DataFrame) -> dict:
    """
    Generate summary statistics about the dataset.

    Args:
        df: Input DataFrame

    Returns:
        Dictionary with summary statistics
    """
    summary = {
        "total_players": len(df),
        "seasons": f"{df['season'].min()}-{df['season'].max()}",
        "players_with_outcomes": df["NBA_impact"].notna().sum(),
        "prospects_2026": (df["season"] == 2026).sum(),
        "international_players": df["international"].sum(),
        "unique_seasons": df["season"].nunique(),
        "missing_values": df.isnull().sum().to_dict(),
    }

    return summary


if __name__ == "__main__":
    # Load and display summary
    df = load_base_data()
    train, test = split_train_test(df)

    print("\n" + "=" * 60)
    print("DATA SUMMARY")
    print("=" * 60)
    summary = get_data_summary(df)
    for key, value in summary.items():
        if key != "missing_values":
            print(f"{key}: {value}")

    print("\n2026 Prospects:")
    print(test[["name", "height", "age"]].to_string(index=False))
