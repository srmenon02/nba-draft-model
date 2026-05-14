"""
JSON export module for NBA Draft Model.

Generates static JSON files consumed by Next.js frontend:
1. prospects.json - All 2026 prospects with predictions
2. comparisons.json - Player similarity comparisons
3. metric_importance.json - Global feature importance rankings
4. big_board.json - Top prospects ranked by prediction
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any
from pathlib import Path
import json
from datetime import datetime


def load_model_artifacts(models_dir: Path) -> Dict[str, Any]:
    """
    Load all model artifacts (predictions, comparisons, SHAP analysis).
    
    Args:
        models_dir: Directory containing model outputs
    
    Returns:
        Dictionary with all model artifacts
    """
    print(f"\n{'='*80}")
    print("LOADING MODEL ARTIFACTS")
    print(f"{'='*80}")
    
    artifacts = {}
    
    # Load feature importance
    importance_path = models_dir / "feature_importance.json"
    if importance_path.exists():
        with open(importance_path, 'r') as f:
            artifacts['feature_importance'] = json.load(f)
        print(f"✓ Loaded feature importance")
    
    # Load prospect explanations
    explanations_path = models_dir / "prospect_explanations.json"
    if explanations_path.exists():
        with open(explanations_path, 'r') as f:
            artifacts['explanations'] = json.load(f)
        print(f"✓ Loaded prospect explanations")
    
    # Load player comparisons
    comparisons_path = models_dir / "player_comparisons.json"
    if comparisons_path.exists():
        with open(comparisons_path, 'r') as f:
            artifacts['comparisons'] = json.load(f)
        print(f"✓ Loaded player comparisons")
    
    # Load CV results
    cv_path = models_dir / "cv_results.json"
    if cv_path.exists():
        with open(cv_path, 'r') as f:
            artifacts['cv_results'] = json.load(f)
        print(f"✓ Loaded CV results")
    
    return artifacts


def build_prospects_json(
    df: pd.DataFrame,
    artifacts: Dict[str, Any],
    prospect_year: int = 2026
) -> List[Dict]:
    """
    Build prospects.json with all prospect data.
    
    Args:
        df: DataFrame with prospect data and predictions
        artifacts: Model artifacts dictionary
        prospect_year: Draft year
    
    Returns:
        List of prospect dictionaries
    """
    print(f"\n{'='*80}")
    print(f"BUILDING PROSPECTS JSON ({prospect_year})")
    print(f"{'='*80}")
    
    prospects_df = df[df['season'] == prospect_year].copy()
    
    # Get explanations lookup
    explanations_lookup = {}
    if 'explanations' in artifacts:
        for exp in artifacts['explanations']:
            explanations_lookup[exp['name']] = exp
    
    prospects_list = []
    
    for _, row in prospects_df.iterrows():
        name = row['name']
        
        # Get SHAP explanation if available
        explanation = explanations_lookup.get(name, {})
        
        prospect_dict = {
            'id': str(row.get('id', name.lower().replace(' ', '-'))),
            'name': name,
            'position': row.get('position', 'N/A'),
            'height': float(row['height']) if pd.notna(row.get('height')) else None,
            'age': float(row['age']) if pd.notna(row.get('age')) else None,
            'international': bool(row.get('international', 0)),
            
            # College stats
            'stats': {
                'points': float(row['pts']) if pd.notna(row.get('pts')) else None,
                'assists': float(row['ast']) if pd.notna(row.get('ast')) else None,
                'rebounds': float(row['oreb'] + row['dreb']) if pd.notna(row.get('oreb')) and pd.notna(row.get('dreb')) else None,
                'steals': float(row['stl']) if pd.notna(row.get('stl')) else None,
                'blocks': float(row['blks']) if pd.notna(row.get('blks')) else None,
                'gamesPlayed': int(row['gp']) if pd.notna(row.get('gp')) else None,
                'minutesPerGame': float(row['mpg']) if pd.notna(row.get('mpg')) else None,
            },
            
            # Efficiency metrics
            'metrics': {
                'trueShooting': float(row['ts_pct']) if pd.notna(row.get('ts_pct')) else None,
                'freeThrowPct': float(row['ft_pct']) if pd.notna(row.get('ft_pct')) else None,
                'threePointPct': float(row['three_pt_pct']) if pd.notna(row.get('three_pt_pct')) else None,
                'rimPct': float(row['rim_pct']) if pd.notna(row.get('rim_pct')) else None,
                'assistToTurnover': float(row['ast_to_tov']) if pd.notna(row.get('ast_to_tov')) else None,
            },
            
            # Predictions
            'prediction': {
                'nbaImpact': float(explanation.get('predicted_impact', 0)),
                'grade': calculate_grade(explanation.get('predicted_impact', 0)),
                'confidence': 'medium',  # Could calculate from SHAP variance
            },
            
            # SHAP explanation
            'explanation': {
                'positiveFactors': explanation.get('top_positive_factors', [])[:3],
                'negativeFactors': explanation.get('top_negative_factors', [])[:3],
            }
        }
        
        prospects_list.append(prospect_dict)
    
    print(f"✓ Built {len(prospects_list)} prospect entries")
    return prospects_list


def calculate_grade(nba_impact: float) -> str:
    """
    Calculate letter grade from NBA impact score.
    
    Args:
        nba_impact: Predicted NBA impact score
    
    Returns:
        Letter grade (A+ to F)
    """
    if nba_impact >= 4.0:
        return 'A+'
    elif nba_impact >= 3.0:
        return 'A'
    elif nba_impact >= 2.0:
        return 'A-'
    elif nba_impact >= 1.0:
        return 'B+'
    elif nba_impact >= 0.5:
        return 'B'
    elif nba_impact >= 0.0:
        return 'B-'
    elif nba_impact >= -0.5:
        return 'C+'
    elif nba_impact >= -1.0:
        return 'C'
    else:
        return 'C-'


def build_comparisons_json(artifacts: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Build comparisons.json with player similarity data.
    
    Args:
        artifacts: Model artifacts dictionary
    
    Returns:
        Dictionary mapping prospect names to comparisons
    """
    print(f"\n{'='*80}")
    print("BUILDING COMPARISONS JSON")
    print(f"{'='*80}")
    
    if 'comparisons' not in artifacts:
        print("⚠ No comparisons data available")
        return {}
    
    comparisons = artifacts['comparisons']
    
    # Format for frontend
    formatted_comparisons = {}
    for prospect_name, comps in comparisons.items():
        formatted_comparisons[prospect_name] = [
            {
                'name': comp['name'],
                'draftYear': comp['draft_year'],
                'position': comp['position'],
                'similarityScore': round(comp['similarity_score'], 3),
                'nbaImpact': comp['nba_impact'],
                'nbaSeasons': comp['nba_seasons'],
            }
            for comp in comps[:10]  # Top 10 comps
        ]
    
    print(f"✓ Built comparisons for {len(formatted_comparisons)} prospects")
    return formatted_comparisons


def build_metric_importance_json(artifacts: Dict[str, Any]) -> List[Dict]:
    """
    Build metric_importance.json with feature importance rankings.
    
    Args:
        artifacts: Model artifacts dictionary
    
    Returns:
        List of feature importance dictionaries
    """
    print(f"\n{'='*80}")
    print("BUILDING METRIC IMPORTANCE JSON")
    print(f"{'='*80}")
    
    if 'feature_importance' not in artifacts:
        print("⚠ No feature importance data available")
        return []
    
    importance_list = artifacts['feature_importance']
    
    # Format for frontend with readable names
    feature_name_map = {
        'age': 'Age',
        'height': 'Height',
        'international': 'International',
        'ts_pct': 'True Shooting %',
        'ft_pct': 'Free Throw %',
        'three_pt_pct': 'Three Point %',
        'rim_pct': 'Rim %',
        'ast_to_tov': 'Assist/Turnover Ratio',
        'pts_per_40': 'Points (per 40)',
        'ast_per_40': 'Assists (per 40)',
        'oreb_per_40': 'Offensive Rebounds (per 40)',
        'dreb_per_40': 'Defensive Rebounds (per 40)',
        'stl_per_40': 'Steals (per 40)',
        'blks_per_40': 'Blocks (per 40)',
        'tov_per_40': 'Turnovers (per 40)',
        'scoring_volume_efficiency': 'Scoring Efficiency',
        'playmaking_composite': 'Playmaking',
        'defensive_composite': 'Defensive Impact',
        'rebounding_composite': 'Rebounding Rate',
        'versatility_score': 'Versatility',
        'sos': 'Strength of Schedule',
        'team_strength': 'Team Strength',
    }
    
    formatted_importance = []
    for item in importance_list[:20]:  # Top 20
        feature = item['feature']
        formatted_importance.append({
            'metric': feature_name_map.get(feature, feature),
            'importance': round(item['importance'], 4),
            'importancePercent': round(item['importance_pct'], 2),
        })
    
    print(f"✓ Built {len(formatted_importance)} metric importance entries")
    return formatted_importance


def build_big_board_json(prospects_list: List[Dict]) -> List[Dict]:
    """
    Build big_board.json with top prospects ranked.
    
    Args:
        prospects_list: List of prospect dictionaries
    
    Returns:
        Sorted list of top prospects
    """
    print(f"\n{'='*80}")
    print("BUILDING BIG BOARD JSON")
    print(f"{'='*80}")
    
    # Sort by predicted NBA impact
    big_board = sorted(
        prospects_list,
        key=lambda x: x['prediction']['nbaImpact'],
        reverse=True
    )
    
    # Add ranking
    for i, prospect in enumerate(big_board, 1):
        prospect['rank'] = i
    
    print(f"✓ Built big board with {len(big_board)} prospects")
    return big_board


def build_metadata_json(artifacts: Dict[str, Any]) -> Dict:
    """
    Build metadata.json with model performance and generation info.
    
    Args:
        artifacts: Model artifacts dictionary
    
    Returns:
        Metadata dictionary
    """
    cv_results = artifacts.get('cv_results', {})
    
    metadata = {
        'generatedAt': datetime.now().isoformat(),
        'draftYear': 2026,
        'modelVersion': '1.0.0',
        'modelPerformance': {
            'spearmanRho': cv_results.get('overall_spearman'),
            'rmse': cv_results.get('overall_rmse'),
            'mae': cv_results.get('overall_mae'),
        },
        'dataSource': 'Basketball-Reference, nba_api',
        'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
    }
    
    return metadata


def save_json_exports(output_dir: Path, data_dict: Dict[str, Any]):
    """
    Save all JSON exports to output directory.
    
    Args:
        output_dir: Directory to save JSON files
        data_dict: Dictionary with all JSON data
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n{'='*80}")
    print("SAVING JSON EXPORTS")
    print(f"{'='*80}")
    
    for filename, data in data_dict.items():
        filepath = output_dir / filename
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✓ Saved {filepath}")
    
    print(f"\n✓ All exports saved to: {output_dir}")


if __name__ == "__main__":
    """Test JSON export module."""
    print("Testing JSON export module...")
    
    # Load data
    data_path = Path(__file__).parent.parent.parent.parent / "data/processed/enhanced_draft_data.csv"
    df = pd.read_csv(data_path)
    
    # Load model artifacts
    models_dir = Path(__file__).parent.parent.parent.parent / "data/models"
    artifacts = load_model_artifacts(models_dir)
    
    # Build JSON exports
    prospects_data = build_prospects_json(df, artifacts)
    comparisons_data = build_comparisons_json(artifacts)
    importance_data = build_metric_importance_json(artifacts)
    big_board_data = build_big_board_json(prospects_data)
    metadata = build_metadata_json(artifacts)
    
    # Save all exports
    output_dir = Path(__file__).parent.parent.parent.parent / "frontend/public/data"
    
    exports = {
        'prospects.json': prospects_data,
        'comparisons.json': comparisons_data,
        'metric_importance.json': importance_data,
        'big_board.json': big_board_data,
        'metadata.json': metadata,
    }
    
    save_json_exports(output_dir, exports)
    
    print("\n" + "="*80)
    print("✓ JSON EXPORT MODULE TESTS PASSED")
    print("="*80)
    print("\nGenerated files:")
    for filename in exports.keys():
        print(f"  • {filename}")
