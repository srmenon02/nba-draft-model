"""
Cosine similarity engine for finding player comparisons.

Uses z-scored features to find historical players most similar to draft prospects.
Similarity is based on playing style, production metrics, and physical attributes.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler


def prepare_similarity_features(
    df: pd.DataFrame, feature_cols: List[str], position_col: str = "position"
) -> Tuple[pd.DataFrame, StandardScaler]:
    """
    Prepare features for similarity calculations.

    Z-score normalizes features within position groups for fair comparisons.

    Args:
        df: DataFrame with features
        feature_cols: List of features to use for similarity
        position_col: Position column for position-specific normalization

    Returns:
        Tuple of (normalized_features_df, scaler)
    """
    print(f"\n{'='*80}")
    print("PREPARING SIMILARITY FEATURES")
    print(f"{'='*80}")
    print(f"Total players: {len(df)}")
    print(f"Features: {len(feature_cols)}")

    # Copy relevant columns
    df_sim = df[["name", "season", position_col] + feature_cols].copy()

    # Fill missing values with column median
    for col in feature_cols:
        if df_sim[col].isna().any():
            median_val = df_sim[col].median()
            df_sim[col] = df_sim[col].fillna(median_val)

    # Z-score normalization within each position group
    # This makes guards comparable to guards, bigs comparable to bigs, etc.
    normalized_features = []

    for position in df_sim[position_col].unique():
        position_mask = df_sim[position_col] == position
        position_df = df_sim[position_mask].copy()

        # Standardize features for this position
        scaler = StandardScaler()
        position_features_scaled = scaler.fit_transform(position_df[feature_cols])

        # Add back to dataframe
        position_df[feature_cols] = position_features_scaled
        normalized_features.append(position_df)

    df_normalized = pd.concat(normalized_features, ignore_index=True)

    print("✓ Features normalized by position")
    return df_normalized, scaler


def find_similar_players(
    prospect_features: np.ndarray,
    historical_features: np.ndarray,
    historical_players: pd.DataFrame,
    prospect_position: str,
    prospect_height: float,
    top_n: int = 10,
    min_games: int = 25,
    exclude_same_year: bool = True,
    prospect_year: Optional[int] = None,
    position_weight: float = 0.3,
    height_weight: float = 0.2,
) -> pd.DataFrame:
    """
    Find most similar historical players using cosine similarity with position/size weighting.

    Args:
        prospect_features: Feature vector for prospect (1D array)
        historical_features: Feature matrix for historical players (2D array)
        historical_players: DataFrame with player metadata
        prospect_position: Prospect's position
        prospect_height: Prospect's height in inches
        top_n: Number of similar players to return
        min_games: Minimum NBA games played for comparison
        exclude_same_year: Exclude players from same draft class
        prospect_year: Prospect's draft year (for exclusion)
        position_weight: Weight for position similarity (0-1)
        height_weight: Weight for height similarity (0-1)

    Returns:
        DataFrame with top similar players and similarity scores
    """
    # Calculate cosine similarity on playing style
    style_similarities = cosine_similarity(
        prospect_features.reshape(1, -1), historical_features
    )[0]

    # Calculate position similarity (1.0 for same position, 0.5 for adjacent, 0.0 otherwise)
    # Modern 3-position system: Guard, Wing, Big
    position_map = {"Guard": 0, "Wing": 1, "Big": 2}
    prospect_pos_idx = position_map.get(
        prospect_position, 1
    )  # Default to Wing if unknown

    position_similarities = []
    for _, player in historical_players.iterrows():
        player_pos_idx = position_map.get(player["position"], 1)
        pos_diff = abs(prospect_pos_idx - player_pos_idx)
        if pos_diff == 0:
            pos_sim = 1.0  # Same position (e.g., Guard-Guard)
        elif pos_diff == 1:
            pos_sim = 0.5  # Adjacent position (e.g., Guard-Wing, Wing-Big)
        else:
            pos_sim = 0.0  # Opposite ends (Guard-Big)
        position_similarities.append(pos_sim)
    position_similarities = np.array(position_similarities)

    # Calculate height similarity (1.0 for within 2 inches, decays with distance)
    height_similarities = []
    for _, player in historical_players.iterrows():
        player_height = player.get("height", prospect_height)
        height_diff = abs(prospect_height - player_height)
        # Similarity decays: 1.0 within 2", 0.5 at 4", 0.0 at 6"+ difference
        height_sim = max(0.0, 1.0 - (height_diff / 6.0))
        height_similarities.append(height_sim)
    height_similarities = np.array(height_similarities)

    # Weighted combination: playing style + position bonus + height bonus
    style_weight = 1.0 - position_weight - height_weight
    similarities = (
        style_weight * style_similarities
        + position_weight * position_similarities
        + height_weight * height_similarities
    )

    # Add similarities to player data
    comparisons = historical_players.copy()
    comparisons["similarity"] = similarities

    # Filter by criteria
    if min_games > 0 and "NBA_minutes" in comparisons.columns:
        # Estimate games from minutes (assume ~20 min/game average)
        comparisons["est_games"] = comparisons["NBA_minutes"] / 20
        comparisons = comparisons[comparisons["est_games"] >= min_games]

    if exclude_same_year and prospect_year is not None:
        comparisons = comparisons[comparisons["season"] != prospect_year]

    # Sort by similarity
    comparisons = comparisons.sort_values("similarity", ascending=False)

    return comparisons.head(top_n)


def generate_all_prospect_comparisons(
    df_normalized: pd.DataFrame,
    feature_cols: List[str],
    df_original: pd.DataFrame,
    prospect_year: int = 2026,
    top_n: int = 10,
) -> Dict[str, List[Dict]]:
    """
    Generate player comparisons for all prospects.

    Args:
        df_normalized: DataFrame with z-scored features
        feature_cols: List of feature columns
        df_original: Original DataFrame with NBA outcome data
        prospect_year: Draft year of prospects
        top_n: Number of comparisons per prospect

    Returns:
        Dictionary mapping prospect names to lists of comparisons
    """
    print(f"\n{'='*80}")
    print(f"GENERATING PLAYER COMPARISONS FOR {prospect_year} CLASS")
    print(f"{'='*80}")

    # Separate prospects from historical players
    prospects_mask = df_normalized["season"] == prospect_year
    historical_mask = (df_normalized["season"] < prospect_year) & (
        df_original["NBA_impact"].notna()
    )

    prospects = df_normalized[prospects_mask].copy()
    historical = df_normalized[historical_mask].copy()
    historical_original = df_original[historical_mask].copy()

    print(f"Prospects to analyze: {len(prospects)}")
    print(f"Historical players pool: {len(historical)}")

    # Prepare feature matrices
    prospect_features = prospects[feature_cols].values
    historical_features = historical[feature_cols].values

    # Generate comparisons for each prospect
    all_comparisons = {}

    for array_idx, (df_idx, prospect) in enumerate(prospects.iterrows()):
        prospect_name = prospect["name"]
        prospect_feat = prospect_features[array_idx]
        prospect_position = prospect["position"]
        prospect_height = prospect.get("height", 75.0)  # Default to 75" if missing

        # Find similar players with position/height weighting
        similar = find_similar_players(
            prospect_feat,
            historical_features,
            historical.merge(
                historical_original[
                    ["name", "season", "NBA_impact", "NBA_minutes", "NBA_seasons"]
                ],
                on=["name", "season"],
                how="left",
            ),
            prospect_position=prospect_position,
            prospect_height=prospect_height,
            top_n=top_n,
            prospect_year=prospect_year,
            position_weight=0.3,
            height_weight=0.2,
        )

        # Format comparisons
        comparisons = []
        for _, comp in similar.iterrows():
            comparisons.append(
                {
                    "name": comp["name"],
                    "draft_year": int(comp["season"]),
                    "position": comp["position"],
                    "similarity_score": float(comp["similarity"]),
                    "nba_impact": (
                        float(comp["NBA_impact"])
                        if pd.notna(comp["NBA_impact"])
                        else None
                    ),
                    "nba_seasons": (
                        int(comp["NBA_seasons"])
                        if pd.notna(comp["NBA_seasons"])
                        else None
                    ),
                }
            )

        all_comparisons[prospect_name] = comparisons

    print(f"✓ Generated comparisons for {len(all_comparisons)} prospects")

    return all_comparisons


def print_prospect_comparisons(
    comparisons_dict: Dict[str, List[Dict]], top_prospects: int = 5
) -> str:
    """
    Generate readable comparison summaries.

    Args:
        comparisons_dict: Dictionary of prospect comparisons
        top_prospects: Number of top prospects to print

    Returns:
        Formatted string with comparisons
    """
    lines = []
    lines.append("\n" + "=" * 80)
    lines.append(f"PLAYER COMPARISONS (Top {top_prospects} Prospects)")
    lines.append("=" * 80)

    # Sort prospects by average NBA impact of comparisons (proxy for projection)
    prospect_scores = []
    for prospect, comps in comparisons_dict.items():
        avg_impact = np.mean(
            [c["nba_impact"] for c in comps if c["nba_impact"] is not None]
        )
        prospect_scores.append((prospect, avg_impact))

    prospect_scores.sort(key=lambda x: x[1], reverse=True)

    for prospect, avg_impact in prospect_scores[:top_prospects]:
        comps = comparisons_dict[prospect]
        lines.append(f"\n{prospect}")
        lines.append(f"  Average comp NBA impact: {avg_impact:.2f}")
        lines.append("  Similar players:")

        for i, comp in enumerate(comps[:5], 1):
            impact_str = (
                f"{comp['nba_impact']:.2f}" if comp["nba_impact"] is not None else "N/A"
            )
            seasons_str = (
                f"{comp['nba_seasons']} seasons" if comp["nba_seasons"] else "N/A"
            )
            lines.append(
                f"    {i}. {comp['name']} ({comp['draft_year']}, {comp['position']}) - "
                f"Similarity: {comp['similarity_score']:.3f}, NBA: {impact_str}, {seasons_str}"
            )

    return "\n".join(lines)


def save_comparisons(comparisons_dict: Dict[str, List[Dict]], output_dir: Path):
    """
    Save player comparisons to JSON.

    Args:
        comparisons_dict: Dictionary of prospect comparisons
        output_dir: Directory to save results
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    import json

    # Save comparisons
    comparisons_path = output_dir / "player_comparisons.json"
    with open(comparisons_path, "w") as f:
        json.dump(comparisons_dict, f, indent=2)
    print(f"\n✓ Player comparisons saved to: {comparisons_path}")

    # Save readable summary
    readable = print_prospect_comparisons(comparisons_dict, top_prospects=15)
    summary_path = output_dir / "comparisons_summary.txt"
    with open(summary_path, "w") as f:
        f.write(readable)
    print(f"✓ Readable summary saved to: {summary_path}")


if __name__ == "__main__":
    """Test similarity engine."""
    print("Testing cosine similarity engine...")

    # Import dependencies
    import sys

    sys.path.insert(0, str(Path(__file__).parent.parent))
    from features.normalize import (
        reclassify_positions,
        normalize_per_40,
        winsorize_outliers,
        adjust_for_age,
        create_composite_features,
        get_default_feature_list,
    )

    # Load data
    data_path = (
        Path(__file__).parent.parent.parent.parent
        / "data/processed/enhanced_draft_data.csv"
    )
    df = pd.read_csv(data_path)

    print(f"\nLoaded {len(df)} players")

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
    df = create_composite_features(df)

    # Get similarity features (exclude age and international, but keep height for reference)
    feature_cols = get_default_feature_list(df)

    # Remove demographic features to focus on playing style (height handled separately)
    demographic_features = ["age", "international", "height"]
    similarity_features = [f for f in feature_cols if f not in demographic_features]

    print(f"Using {len(similarity_features)} features for similarity")

    # Prepare normalized features
    df_normalized, scaler = prepare_similarity_features(df, similarity_features)

    # Generate comparisons for 2026 prospects
    comparisons = generate_all_prospect_comparisons(
        df_normalized, similarity_features, df, prospect_year=2026, top_n=10
    )

    # Print readable comparisons
    readable = print_prospect_comparisons(comparisons, top_prospects=10)
    print(readable)

    # Save results
    output_dir = Path(__file__).parent.parent.parent.parent / "data/models"
    save_comparisons(comparisons, output_dir)

    print("\n" + "=" * 80)
    print("✓ SIMILARITY ENGINE TESTS PASSED")
    print("=" * 80)
