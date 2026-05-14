"""
Basketball-Reference web scraper with proper rate limiting and robots.txt compliance.

IMPORTANT: This scraper respects Basketball-Reference's Terms of Service:
- Rate limited to 1 request per 3 seconds (20 requests/minute max)
- Respects robots.txt directives
- Caches all responses to avoid re-scraping
- User-Agent identifies the purpose
- For personal, non-commercial use only
"""

import requests
from bs4 import BeautifulSoup
import time
import json
from pathlib import Path
from typing import Dict, Optional
import pandas as pd
from urllib.robotparser import RobotFileParser


class BasketballReferenceScraper:
    """
    Scraper for Basketball-Reference with built-in rate limiting and caching.
    """
    
    BASE_URL = "https://www.basketball-reference.com"
    DELAY_SECONDS = 3  # Conservative rate limit
    
    def __init__(self, cache_dir: str = "data/raw/bball_ref_cache"):
        """
        Initialize scraper with caching.
        
        Args:
            cache_dir: Directory to store cached responses
        """
        self.cache_dir = Path(__file__).parent.parent.parent / cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'NBA Draft Model Research Bot (Educational/Personal Use)'
        })
        
        self.last_request_time = 0
        self.robots_parser = self._load_robots_txt()
        
    def _load_robots_txt(self) -> RobotFileParser:
        """Load and parse robots.txt from Basketball-Reference."""
        parser = RobotFileParser()
        parser.set_url(f"{self.BASE_URL}/robots.txt")
        try:
            parser.read()
            print("✓ Loaded robots.txt successfully")
        except Exception as e:
            print(f"Warning: Could not load robots.txt: {e}")
        return parser
    
    def _can_fetch(self, url: str) -> bool:
        """Check if URL is allowed by robots.txt."""
        return self.robots_parser.can_fetch("*", url)
    
    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.DELAY_SECONDS:
            sleep_time = self.DELAY_SECONDS - elapsed
            print(f"  Rate limiting: sleeping {sleep_time:.1f}s...")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def _get_cache_path(self, identifier: str) -> Path:
        """Get cache file path for a given identifier."""
        safe_id = identifier.replace('/', '_').replace(' ', '_')
        return self.cache_dir / f"{safe_id}.json"
    
    def fetch_player_college_stats(self, player_name: str, draft_year: int) -> Optional[Dict]:
        """
        Fetch college statistics for a player.
        
        Args:
            player_name: Player name
            draft_year: Draft year
            
        Returns:
            Dictionary with additional stats or None if not found
        """
        cache_path = self._get_cache_path(f"{player_name}_{draft_year}")
        
        # Check cache first
        if cache_path.exists():
            print(f"  ✓ Using cached data for {player_name}")
            return json.loads(cache_path.read_text())
        
        # Construct URL (simplified - would need actual player page URL)
        # Note: This is a placeholder - actual implementation would need player ID lookup
        print(f"  Fetching {player_name} (draft {draft_year})...")
        
        # For now, return None - actual scraping would happen here
        # This prevents accidental mass-scraping during development
        return None
    
    def fetch_nba_combine_measurements(self, year: int) -> Optional[pd.DataFrame]:
        """
        Fetch NBA Draft Combine measurements for a given year.
        
        Args:
            year: Draft year
            
        Returns:
            DataFrame with combine measurements or None
        """
        cache_path = self._get_cache_path(f"combine_{year}")
        
        # Check cache
        if cache_path.exists():
            print(f"  ✓ Using cached combine data for {year}")
            data = json.loads(cache_path.read_text())
            return pd.DataFrame(data)
        
        url = f"{self.BASE_URL}/draft/NBA_{year}_combine.html"
        
        # Check robots.txt
        if not self._can_fetch(url):
            print(f"  ✗ URL not allowed by robots.txt: {url}")
            return None
        
        # Rate limit
        self._rate_limit()
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Find combine table
            table = soup.find('table', {'id': 'combine'})
            if not table:
                print(f"  ✗ No combine table found for {year}")
                return None
            
            # Parse table (simplified - actual parsing would extract all measurements)
            rows = []
            for row in table.find('tbody').find_all('tr'):
                if row.find('th'):
                    player_name = row.find('th').text.strip()
                    cells = row.find_all('td')
                    if len(cells) >= 6:
                        rows.append({
                            'name': player_name,
                            'height_wo_shoes': cells[0].text.strip(),
                            'height_w_shoes': cells[1].text.strip(),
                            'weight': cells[2].text.strip(),
                            'wingspan': cells[3].text.strip(),
                            'standing_reach': cells[4].text.strip(),
                            'vertical_max': cells[5].text.strip()
                        })
            
            df = pd.DataFrame(rows)
            
            # Cache the result
            cache_path.write_text(df.to_json(orient='records'))
            print(f"  ✓ Fetched and cached combine data for {year} ({len(df)} players)")
            
            return df
            
        except requests.RequestException as e:
            print(f"  ✗ Error fetching {url}: {e}")
            return None
    
    def get_advanced_stats_mapping(self) -> Dict[str, str]:
        """
        Return mapping of advanced stats we want to collect.
        
        Returns:
            Dictionary mapping stat name to description
        """
        return {
            'ws_per_48': 'Win Shares per 48 minutes',
            'bpm': 'Box Plus/Minus',
            'per': 'Player Efficiency Rating',
            'ts_pct': 'True Shooting Percentage',
            'efg_pct': 'Effective Field Goal Percentage',
            'usg_pct': 'Usage Percentage',
            'ast_pct': 'Assist Percentage',
            'reb_pct': 'Rebound Percentage',
            'stl_pct': 'Steal Percentage',
            'blk_pct': 'Block Percentage',
            'tov_pct': 'Turnover Percentage'
        }


if __name__ == "__main__":
    print("Basketball-Reference Scraper")
    print("="*60)
    print("IMPORTANT: This scraper respects Basketball-Reference ToS")
    print("- Rate limited to 1 request per 3 seconds")
    print("- Respects robots.txt")
    print("- Caches all responses")
    print("- Personal, non-commercial use only")
    print("="*60)
    
    scraper = BasketballReferenceScraper()
    
    # Test with a single year's combine data
    print("\nTesting combine data fetch for 2024...")
    combine_2024 = scraper.fetch_nba_combine_measurements(2024)
    if combine_2024 is not None:
        print(f"\nSample combine data:")
        print(combine_2024.head())
