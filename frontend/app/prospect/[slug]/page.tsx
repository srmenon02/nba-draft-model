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
    <main className="flex-1 bg-gradient-to-b from-background via-background to-card">
      {/* Header - Arena Style */}
      <div className="bg-card border-b-4 border-primary relative overflow-hidden">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-spotlight opacity-30 pointer-events-none" />
        {/* Angular Court Lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-10 w-1 h-full bg-primary transform -skew-x-12" />
          <div className="absolute top-0 right-10 w-1 h-full bg-accent transform skew-x-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-6 font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={18} strokeWidth={3} />
            Back to Board
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 sm:gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-foreground mb-3 font-sans tracking-tighter uppercase leading-none">
                {prospect.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="text-primary font-black">{prospect.position}</span>
                </span>
                <span className="text-primary">▪</span>
                <span>
                  {Math.floor(prospect.height / 12)}'{prospect.height % 12}"
                </span>
                <span className="text-primary">▪</span>
                <span>{prospect.age.toFixed(1)} YRS</span>
                {prospect.international && (
                  <>
                    <span className="text-primary">▪</span>
                    <span className="text-accent font-black">INTL</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
              <div className="text-right bg-secondary/20 border-2 border-primary/40 px-6 py-4 rounded">
                <div className="text-[10px] uppercase tracking-widest text-primary font-black mb-2">GRADE</div>
                <div className={`text-4xl sm:text-5xl font-black font-mono ${gradeColor}`}>
                  {prospect.prediction.grade}
                </div>
              </div>
              <div className="text-right bg-secondary/20 border-2 border-accent/40 px-6 py-4 rounded">
                <div className="text-[10px] uppercase tracking-widest text-accent font-black mb-2">NBA IMPACT</div>
                <div className="text-4xl sm:text-5xl font-black font-mono text-accent">
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
            <div className="bg-card border-2 border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/30 px-4 sm:px-6 py-4 border-b-2 border-primary/40">
                <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
                  Physical Profile
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">NBA Draft Combine</p>
              </div>
              
              <div className="p-4 sm:p-6">
                {prospect.combineStats.attendedCombine ? (
                  <div className="space-y-4">
                    {/* Raw Measurements */}
                    <div>
                      <h3 className="text-sm font-black text-primary mb-3 uppercase tracking-wide">Measurements</h3>
                      <div className="space-y-2">
                        {prospect.combineStats.wingspan != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Wingspan</span>
                            <span className="text-foreground font-black font-mono">
                              {inchesToFeetInches(prospect.combineStats.wingspan)}
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.weight != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Weight</span>
                            <span className="text-foreground font-black font-mono">
                              {prospect.combineStats.weight.toFixed(1)} lbs
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.standingReach != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Standing Reach</span>
                            <span className="text-foreground font-black font-mono">
                              {inchesToFeetInches(prospect.combineStats.standingReach)}
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.verticalMax != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Max Vertical</span>
                            <span className="text-foreground font-black font-mono">
                              {prospect.combineStats.verticalMax.toFixed(1)}"
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.benchPress != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Bench Press</span>
                            <span className="text-foreground font-black font-mono">
                              {prospect.combineStats.benchPress} reps
                            </span>
                          </div>
                        )}
                        {prospect.combineStats.bodyFatPct != null && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Body Fat</span>
                            <span className="text-foreground font-black font-mono">
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
                        <h3 className="text-sm font-black text-primary mb-3 uppercase tracking-wide">Derived Metrics</h3>
                        <div className="space-y-2">
                          {prospect.combineStats.wingspanToHeight != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-bold uppercase tracking-wider">Wingspan/Height</span>
                              <span className="text-foreground font-black font-mono">
                                {prospect.combineStats.wingspanToHeight.toFixed(3)}
                              </span>
                            </div>
                          )}
                          {prospect.combineStats.bodyMassIndex != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-bold uppercase tracking-wider">BMI</span>
                              <span className="text-foreground font-black font-mono">
                                {prospect.combineStats.bodyMassIndex.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {prospect.combineStats.reachAdvantage != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-bold uppercase tracking-wider">Reach Advantage</span>
                              <span className="text-foreground font-black font-mono">
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
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">No Combine Data</p>
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
