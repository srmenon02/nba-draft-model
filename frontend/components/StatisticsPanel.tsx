import type { Prospect } from '@/lib/types';

interface StatisticsPanelProps {
  prospect: Prospect;
}

export default function StatisticsPanel({ prospect }: StatisticsPanelProps) {
  const { stats, metrics } = prospect;
  
  // Calculate per-game stats
  const ppg = (stats.points / stats.gamesPlayed).toFixed(1);
  const apg = (stats.assists / stats.gamesPlayed).toFixed(1);
  const rpg = (stats.rebounds / stats.gamesPlayed).toFixed(1);
  const spg = (stats.steals / stats.gamesPlayed).toFixed(1);
  const bpg = (stats.blocks / stats.gamesPlayed).toFixed(1);

  const statisticsGroups = [
    {
      title: 'Per Game Stats',
      stats: [
        { label: 'Points', value: ppg, percentile: 0 },
        { label: 'Assists', value: apg, percentile: 0 },
        { label: 'Rebounds', value: rpg, percentile: 0 },
        { label: 'Steals', value: spg, percentile: 0 },
        { label: 'Blocks', value: bpg, percentile: 0 },
        { label: 'Minutes', value: stats.minutesPerGame.toFixed(1), percentile: 0 },
      ],
    },
    {
      title: 'Efficiency Metrics',
      stats: [
        { label: 'True Shooting %', value: (metrics.trueShooting * 100).toFixed(1) + '%', percentile: 0 },
        { label: 'Free Throw %', value: (metrics.freeThrowPct * 100).toFixed(1) + '%', percentile: 0 },
        { label: '3-Point %', value: (metrics.threePointPct * 100).toFixed(1) + '%', percentile: 0 },
        { label: 'Rim %', value: (metrics.rimPct * 100).toFixed(1) + '%', percentile: 0 },
        { label: 'AST/TO Ratio', value: metrics.assistToTurnover.toFixed(2), percentile: 0 },
      ],
    },
  ];

  return (
    <div className="bg-card border-2 border-border rounded-lg p-6">
      <h2 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight">2025-2026 College Stats</h2>
      
      <div className="space-y-6">
        {statisticsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-black text-primary mb-4 uppercase tracking-wide">{group.title}</h3>
            <div className="space-y-3">
              {group.stats.map((stat) => (
                <div key={stat.label} className="bg-secondary/20 border-l-4 border-primary/40 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <span className="text-xl font-black text-foreground font-mono">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t-2 border-border">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          <span className="font-black text-foreground">{stats.gamesPlayed} GP</span> <span className="text-primary mx-2">▪</span> <span className="font-black text-foreground">{stats.minutesPerGame.toFixed(1)} MPG</span>
        </p>
      </div>
    </div>
  );
}
