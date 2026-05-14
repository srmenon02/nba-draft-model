import Link from 'next/link';
import type { Prospect } from '@/lib/types';
import { getGradeColor } from '@/lib/data';

interface ProspectCardProps {
  prospect: Prospect;
  rank?: number;
}

export default function ProspectCard({ prospect, rank }: ProspectCardProps) {
  const gradeColor = getGradeColor(prospect.prediction.grade);

  return (
    <Link
      href={`/prospect/${prospect.id}`}
      className="block bg-brand-800 border-2 border-brand-700 rounded-xl p-6 hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {rank && (
            <span className="inline-block text-sm text-brand-400 font-mono mb-2">#{rank}</span>
          )}
          <h3 className="text-xl font-bold text-brand-100 mb-1 leading-tight">{prospect.name}</h3>
          <p className="text-base text-brand-400">
            {prospect.position} <span className="text-brand-500">•</span> {prospect.stats.gamesPlayed} games
          </p>
        </div>
        <div className="text-right ml-4">
          <div className={`text-3xl font-bold ${gradeColor} mb-1`}>
            {prospect.prediction.grade}
          </div>
          <div className="text-xs uppercase tracking-wide text-brand-500">Grade</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-brand-500 text-xs uppercase tracking-wide mb-1">NBA Impact</div>
          <div className="font-bold text-brand-100 text-lg">
            {prospect.prediction.nbaImpact >= 0 ? '+' : ''}{prospect.prediction.nbaImpact.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-brand-500 text-xs uppercase tracking-wide mb-1">PPG</div>
          <div className="font-bold text-brand-100 text-lg">
            {(prospect.stats.points / prospect.stats.gamesPlayed).toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-brand-500 text-xs uppercase tracking-wide mb-1">Height</div>
          <div className="font-bold text-brand-100 text-lg">
            {Math.floor(prospect.height / 12)}'{prospect.height % 12}"
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-brand-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-400">Age: <span className="font-semibold text-brand-300">{prospect.age.toFixed(1)}</span></span>
          <span className="text-sm text-accent font-medium">View Profile →</span>
        </div>
      </div>
    </Link>
  );
}
