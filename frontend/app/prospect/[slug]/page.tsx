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

// Helper function to convert inches to feet'inches" format
function inchesToFeetInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches.toFixed(remainingInches % 1 === 0 ? 0 : 1)}"`;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-accent transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft size={16} />
            Back to Draft Board
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-100 mb-2">
                {prospect.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-brand-400">
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
            
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
              <div className="text-right">
                <div className="text-xs text-brand-400 mb-1">Grade</div>
                <div className={`text-3xl sm:text-4xl font-bold ${gradeColor}`}>
                  {prospect.prediction.grade}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-brand-400 mb-1">Predicted NBA Impact</div>
                <div className="text-3xl sm:text-4xl font-bold text-accent">
                  {prospect.prediction.nbaImpact >= 0 ? '+' : ''}
                  {prospect.prediction.nbaImpact.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Left Column - Stats & Physical Profile */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <StatisticsPanel prospect={prospect} />
            
            {/* Physical Profile */}
            <div className="bg-brand-800 border border-brand-700 rounded-lg overflow-hidden">
              <div className="bg-brand-700 px-4 sm:px-6 py-3 border-b border-brand-600">
                <h2 className="text-base sm:text-lg font-semibold text-brand-100">
                  Physical Profile
                </h2>
                <p className="text-xs sm:text-sm text-brand-400 mt-1">NBA Draft Combine</p>
              </div>
              
              <div className="p-4 sm:p-6">
                {prospect.combineStats.attendedCombine ? (
                  <div className="space-y-4">
                    {/* Raw Measurements */}
                    <div>
                      <h3 className="text-sm font-semibold text-brand-300 mb-3">Measurements</h3>
                      <div className="space-y-2">
                        {prospect.combineStats.wingspan != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Wingspan</span>
                            <span className="text-brand-100 font-medium">
                              {inchesToFeetInches(prospect.combineStats.wingspan)}
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.weight != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Weight</span>
                            <span className="text-brand-100 font-medium">
                              {prospect.combineStats.weight.toFixed(1)} lbs
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.standingReach != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Standing Reach</span>
                            <span className="text-brand-100 font-medium">
                              {inchesToFeetInches(prospect.combineStats.standingReach)}
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.verticalMax != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Max Vertical</span>
                            <span className="text-brand-100 font-medium">
                              {prospect.combineStats.verticalMax.toFixed(1)}"
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.benchPress != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Bench Press</span>
                            <span className="text-brand-100 font-medium">
                              {prospect.combineStats.benchPress} reps
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.bodyFatPct != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-400">Body Fat</span>
                            <span className="text-brand-100 font-medium">
                              {prospect.combineStats.bodyFatPct.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Derived Metrics */}
                    {(prospect.combineStats.wingspanToHeight != null ||
                      prospect.combineStats.bodyMassIndex != null ||
                      prospect.combineStats.reachAdvantage != null) && (
                      <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-3">Derived Metrics</h3>
                        <div className="space-y-2">
                          {prospect.combineStats.wingspanToHeight != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-400">Wingspan/Height Ratio</span>
                              <span className="text-brand-100 font-medium">
                                {prospect.combineStats.wingspanToHeight.toFixed(3)}
                              </span>
                            </div>
                          )}
                          {prospect.combineStats.bodyMassIndex != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-400">BMI</span>
                              <span className="text-brand-100 font-medium">
                                {prospect.combineStats.bodyMassIndex.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {prospect.combineStats.reachAdvantage != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-400">Reach Advantage</span>
                              <span className="text-brand-100 font-medium">
                                {prospect.combineStats.reachAdvantage.toFixed(1)}"
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-brand-400">No Combine Data</p>
                  </div>
                )}
              </div>
            </div>
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
