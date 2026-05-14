// TypeScript interfaces matching JSON schema from Python pipeline

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export interface ProspectStats {
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  gamesPlayed: number;
  minutesPerGame: number;
}

export interface ProspectMetrics {
  trueShooting: number;
  freeThrowPct: number;
  threePointPct: number;
  rimPct: number;
  assistToTurnover: number;
}

export interface FeatureContribution {
  feature: string;
  contribution: number;
  value: number;
}

export interface ProspectExplanation {
  positiveFactors: FeatureContribution[];
  negativeFactors: FeatureContribution[];
}

export interface ProspectPrediction {
  nbaImpact: number;
  grade: Grade;
  confidence: string;
}

export interface Prospect {
  id: string;
  name: string;
  position: Position;
  height: number;
  age: number;
  international: boolean;
  stats: ProspectStats;
  metrics: ProspectMetrics;
  prediction: ProspectPrediction;
  explanation: ProspectExplanation;
}

export interface Comparison {
  name: string;
  draftYear: number;
  position: Position;
  similarityScore: number;
  nbaImpact: number;
  nbaSeasons: number;
}

export interface MetricImportance {
  metric: string;
  importance: number;
  importancePercent: number;
}

// Big board uses same Prospect structure, just sorted by impact
export type BigBoardEntry = Prospect;

export interface Metadata {
  generatedAt: string;
  draftYear: number;
  modelVersion: string;
  modelPerformance: {
    spearmanRho: number;
    rmse: number;
    mae: number;
  };
  dataSource: string;
  lastUpdated: string;
}
