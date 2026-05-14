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
    <div className="bg-brand-800 border-2 border-brand-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-brand-100 mb-6">College Statistics</h2>
      
      <div className="space-y-8">
        {statisticsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-lg font-semibold text-brand-200 mb-4">{group.title}</h3>
            <div className="space-y-4">
              {group.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-brand-400">{stat.label}</span>
                    <span className="text-lg font-bold text-brand-100">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-brand-700">
        <p className="text-sm text-brand-400">
          Based on <span className="font-semibold text-brand-300">{stats.gamesPlayed} games</span> played • <span className="font-semibold text-brand-300">{stats.minutesPerGame.toFixed(1)} MPG</span>
        </p>
      </div>
    </div>
  );
}
