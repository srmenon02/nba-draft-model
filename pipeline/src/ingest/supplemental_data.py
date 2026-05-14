"""
Collect supplemental data using nba_api for additional player information.

nba_api is an unofficial library wrapping stats.nba.com. It's more permissive
than Basketball-Reference but still requires caching to avoid rate limits.
"""

import json
from pathlib import Path
from typing import Optional
import pandas as pd
import time


class NBAApiCollector:
    """
    Collector for NBA data using nba_api.
    """

    def __init__(self, cache_dir: str = "data/raw/nba_api_cache"):
        """
        Initialize collector with caching.

        Args:
            cache_dir: Directory to store cached responses
        """
        self.cache_dir = Path(__file__).parent.parent.parent / cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # Try to import nba_api (may not be installed yet)
        try:
            from nba_api.stats.endpoints import draftcombinestats, commonallplayers

            self.draftcombinestats = draftcombinestats
            self.commonallplayers = commonallplayers
            self.available = True
        except ImportError:
            print("Warning: nba_api not installed. Install with: pip install nba_api")
            self.available = False

    def _get_cache_path(self, identifier: str) -> Path:
        """Get cache file path."""
        safe_id = identifier.replace("/", "_").replace(" ", "_")
        return self.cache_dir / f"{safe_id}.json"

    def fetch_draft_combine_stats(self, season: str) -> Optional[pd.DataFrame]:
        """
        Fetch NBA Draft Combine stats for a season.

        Args:
            season: Season string (e.g., '2024-25')

        Returns:
            DataFrame with combine stats or None
        """
        if not self.available:
            return None

        cache_path = self._get_cache_path(f"combine_{season}")

        # Check cache
        if cache_path.exists():
            print(f"  ✓ Using cached combine data for {season}")
            data = json.loads(cache_path.read_text())
            return pd.DataFrame(data)

        try:
            print(f"  Fetching combine data for {season}...")
            time.sleep(0.6)  # Rate limit for nba_api

            combine = self.draftcombinestats.DraftCombineStats(season_all_time=season)
            df = combine.get_data_frames()[0]

            if len(df) > 0:
                # Cache the result
                cache_path.write_text(df.to_json(orient="records"))
                print(f"  ✓ Fetched {len(df)} players from combine {season}")
                return df
            else:
                print(f"  ✗ No data found for {season}")
                return None

        except Exception as e:
            print(f"  ✗ Error fetching combine data: {e}")
            return None

    def get_all_players(self) -> Optional[pd.DataFrame]:
        """
        Fetch list of all NBA players (useful for name matching).

        Returns:
            DataFrame with all players or None
        """
        if not self.available:
            return None

        cache_path = self._get_cache_path("all_players")

        # Check cache
        if cache_path.exists():
            print("  ✓ Using cached all players list")
            data = json.loads(cache_path.read_text())
            return pd.DataFrame(data)

        try:
            print("  Fetching all players list...")
            time.sleep(0.6)

            players = self.commonallplayers.CommonAllPlayers()
            df = players.get_data_frames()[0]

            # Cache the result
            cache_path.write_text(df.to_json(orient="records"))
            print(f"  ✓ Fetched {len(df)} players")
            return df

        except Exception as e:
            print(f"  ✗ Error fetching players: {e}")
            return None

    def collect_combine_data_for_years(
        self, start_year: int, end_year: int
    ) -> pd.DataFrame:
        """
        Collect combine data for multiple years.

        Args:
            start_year: Starting draft year
            end_year: Ending draft year

        Returns:
            Combined DataFrame for all years
        """
        all_data = []

        for year in range(start_year, end_year + 1):
            season = f"{year-1}-{str(year)[-2:]}"
            df = self.fetch_draft_combine_stats(season)
            if df is not None and len(df) > 0:
                df["draft_year"] = year
                all_data.append(df)

        if all_data:
            combined = pd.concat(all_data, ignore_index=True)
            print(
                f"\n✓ Collected combine data for {len(all_data)} years, {len(combined)} total players"
            )
            return combined
        else:
            print("✗ No combine data collected")
            return pd.DataFrame()


def calculate_derived_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate derived metrics from raw stats.

    Args:
        df: DataFrame with raw stats

    Returns:
        DataFrame with additional derived metrics
    """
    df = df.copy()

    # True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
    if all(col in df.columns for col in ["pts", "3fga", "fta"]):
        # Estimate FGA as sum of 3PA + rim attempts + mid-range attempts
        if "rim_made" in df.columns and "rim_miss" in df.columns:
            df["fga_est"] = (
                df["3fga"]
                + (df["rim_made"] + df["rim_miss"])
                + (df.get("mid_made", 0) + df.get("mid_miss", 0))
            )
            df["ts_pct"] = df["pts"] / (2 * (df["fga_est"] + 0.44 * df["fta"]))
            df["ts_pct"] = df["ts_pct"].clip(0, 1)  # Bound between 0 and 1

    # Assist-to-Turnover Ratio
    if "ast" in df.columns and "tov" in df.columns:
        df["ast_to_tov"] = df["ast"] / df["tov"].replace(0, 1)

    # Shooting efficiency metrics
    if "ftm" in df.columns and "fta" in df.columns:
        df["ft_pct"] = df["ftm"] / df["fta"].replace(0, 1)

    if "3fgm" in df.columns and "3fga" in df.columns:
        df["three_pt_pct"] = df["3fgm"] / df["3fga"].replace(0, 1)

    # Rim efficiency
    if "rim_made" in df.columns and "rim_miss" in df.columns:
        df["rim_pct"] = df["rim_made"] / (df["rim_made"] + df["rim_miss"]).replace(0, 1)

    # Dunk rate
    if "dunks_made" in df.columns and "rim_made" in df.columns:
        df["dunk_rate"] = df["dunks_made"] / (df["rim_made"] + df["rim_miss"]).replace(
            0, 1
        )

    return df


if __name__ == "__main__":
    print("NBA API Data Collector")
    print("=" * 60)

    collector = NBAApiCollector()

    if collector.available:
        # Test fetching recent combine data
        print("\nFetching recent combine data (2022-2024)...")
        combine_df = collector.collect_combine_data_for_years(2022, 2024)

        if len(combine_df) > 0:
            print("\nSample data:")
            print(
                combine_df[
                    [
                        "PLAYER_NAME",
                        "POSITION",
                        "HEIGHT_WO_SHOES",
                        "WINGSPAN",
                        "VERTICAL_LEAP",
                    ]
                ].head()
            )
    else:
        print("\nnba_api not available. Install with: pip install nba_api")
