import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProspects, getComparisons, getGradeColor } from '@/lib/data';
import StatisticsPanel from '@/components/StatisticsPanel';
import PlayerComparisons from '@/components/PlayerComparisons';
import PredictionExplanation from '@/components/PredictionExplanation';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const prospects = getProspects();
  return prospects.map((prospect) => ({
    slug: prospect.id,
  }));
}

interface ProspectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProspectPage({ params }: ProspectPageProps) {
  const { slug } = await params;
  const prospects = getProspects();
  const prospect = prospects.find((p) => p.id === slug);

  if (!prospect) {
    notFound();
  }

  const comparisons = getComparisons(prospect.name);
  const gradeColor = getGradeColor(prospect.prediction.grade);

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-brand-800 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Draft Board
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-100 mb-2">
                {prospect.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-brand-400">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-brand-200">{prospect.position}</span>
                </span>
                <span>•</span>
                <span>
                  {Math.floor(prospect.height / 12)}'{prospect.height % 12}"
                </span>
                <span>•</span>
                <span>{prospect.age.toFixed(1)} years old</span>
                {prospect.international && (
                  <>
                    <span>•</span>
                    <span className="text-accent">International</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-brand-400 mb-1">Grade</div>
                <div className={`text-4xl font-bold ${gradeColor}`}>
                  {prospect.prediction.grade}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-brand-400 mb-1">Predicted NBA Impact</div>
                <div className="text-4xl font-bold text-accent">
                  {prospect.prediction.nbaImpact >= 0 ? '+' : ''}
                  {prospect.prediction.nbaImpact.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1">
            <StatisticsPanel prospect={prospect} />
          </div>
          
          {/* Right Column - Comparisons & Explanation */}
          <div className="lg:col-span-2 space-y-8">
            <PredictionExplanation prospect={prospect} />
            <PlayerComparisons comparisons={comparisons} />
          </div>
        </div>
      </div>
    </main>
  );
}
