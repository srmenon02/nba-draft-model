'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Prospect } from '@/lib/types';
import { getGradeColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProspectCardProps {
  prospect: Prospect;
  rank?: number;
  index?: number;
}

export default function ProspectCard({ prospect, rank, index = 0 }: ProspectCardProps) {
  const gradeColor = getGradeColor(prospect.prediction.grade);
  const isTopTier = rank && rank <= 5;
  const ppg = (prospect.stats.points / prospect.stats.gamesPlayed).toFixed(1);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Link href={`/prospect/${prospect.id}`} className="block group">
        <Card 
          className={cn(
            "relative overflow-hidden transition-all duration-300 border-2",
            "hover:shadow-2xl hover:shadow-primary/30 hover:border-primary",
            "focus-within:ring-4 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background",
            isTopTier && "court-line-accent"
          )}
        >
          <CardContent className="p-6 bg-gradient-to-br from-card via-card to-card/80">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {rank && (
                  <Badge 
                    variant="secondary" 
                    className="font-mono text-sm font-black mb-2 bg-primary/20 text-primary border-2 border-primary/40 px-3 py-1"
                  >
                    #{rank}
                  </Badge>
                )}
                <h3 className="text-2xl font-black text-foreground mb-1.5 leading-tight font-sans group-hover:text-primary transition-colors tracking-tight uppercase">
                  {prospect.name}
                </h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                  {prospect.position} <span className="text-primary mx-2">▪</span> {prospect.stats.gamesPlayed} GP
                </p>
              </div>
              
              {/* Grade Badge - Jersey Number Style */}
              <div className="text-right ml-4 shrink-0 relative">
                <div className={cn(
                  "text-5xl font-black font-mono mb-0.5 jersey-number",
                  gradeColor,
                  "group-hover:scale-110 transition-transform"
                )}>
                  {prospect.prediction.grade}
                </div>
                <div className="text-xs uppercase tracking-widest text-primary font-black">
                  GRADE
                </div>
              </div>
            </div>

            {/* Stats Grid - Scoreboard Style */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="space-y-1 bg-secondary/30 border-l-4 border-primary p-3 rounded">
                <div className="text-[10px] uppercase tracking-widest text-primary font-black">
                  IMPACT
                </div>
                <div className="font-black text-foreground text-2xl font-mono leading-none">
                  {prospect.prediction.nbaImpact >= 0 ? '+' : ''}{prospect.prediction.nbaImpact.toFixed(1)}
                </div>
              </div>
              <div className="space-y-1 bg-secondary/30 border-l-4 border-accent p-3 rounded">
                <div className="text-[10px] uppercase tracking-widest text-accent font-black">
                  PPG
                </div>
                <div className="font-black text-foreground text-2xl font-mono leading-none">
                  {ppg}
                </div>
              </div>
              <div className="space-y-1 bg-secondary/30 border-l-4 border-muted-foreground p-3 rounded">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                  HEIGHT
                </div>
                <div className="font-black text-foreground text-2xl font-mono leading-none">
                  {Math.floor(prospect.height / 12)}'{prospect.height % 12}"
                </div>
              </div>
            </div>

            {/* Footer - Action Bar */}
            <div className="pt-3 border-t-2 border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                AGE: <span className="text-foreground font-mono font-black text-sm">{prospect.age.toFixed(1)}</span>
              </span>
              <span className="text-sm text-primary font-black uppercase tracking-wide inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                PROFILE 
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
