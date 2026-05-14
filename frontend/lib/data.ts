// Data loading utilities for static JSON imports

import type {
  Prospect,
  Comparison,
  MetricImportance,
  BigBoardEntry,
  Metadata,
  Position,
} from './types';

// Import JSON data
import prospectsData from '../public/data/prospects.json';
import comparisonsData from '../public/data/comparisons.json';
import metricImportanceData from '../public/data/metric_importance.json';
import bigBoardData from '../public/data/big_board.json';
import metadataData from '../public/data/metadata.json';

/**
 * Get all prospects for the current draft class
 */
export function getProspects(): Prospect[] {
  return prospectsData as Prospect[];
}

/**
 * Get a single prospect by ID
 */
export function getProspectById(id: string): Prospect | undefined {
  const prospects = getProspects();
  return prospects.find((p) => p.id === id);
}

/**
 * Get similar player comparisons for a prospect by name
 */
export function getComparisons(prospectName: string): Comparison[] {
  const comparisons = comparisonsData as Record<string, Comparison[]>;
  return comparisons[prospectName] ?? [];
}

/**
 * Get metric importance rankings
 */
export function getMetricImportance(): MetricImportance[] {
  return metricImportanceData as MetricImportance[];
}

/**
 * Get ranked big board (prospects sorted by predicted impact)
 */
export function getBigBoard(): Prospect[] {
  return bigBoardData as Prospect[];
}

/**
 * Get model metadata
 */
export function getMetadata(): Metadata {
  return metadataData as Metadata;
}

/**
 * Filter prospects by position
 */
export function filterProspectsByPosition(
  prospects: Prospect[],
  position: Position | 'ALL'
): Prospect[] {
  if (position === 'ALL') return prospects;
  return prospects.filter((p) => p.position === position);
}

/**
 * Sort prospects by predicted impact (descending)
 */
export function sortProspectsByImpact(prospects: Prospect[]): Prospect[] {
  return [...prospects].sort((a, b) => b.prediction.nbaImpact - a.prediction.nbaImpact);
}

/**
 * Get grade color for UI styling
 */
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-tier-elite';
  if (grade.startsWith('B')) return 'text-tier-starter';
  if (grade.startsWith('C')) return 'text-tier-role';
  return 'text-tier-bust';
}

/**
 * Format metric name for display
 */
export function formatMetricName(metric: string): string {
  return metric
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
