
'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Sparkles, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getWeeklyMarketOverview, type WeeklyOverviewOutput } from '@/ai/flows/ai-weekly-market-overview-flow';
import { getDailyMarketAnalysis, type DailyAnalysisOutput } from '@/ai/flows/ai-daily-market-analysis-flow';
import { type EconomicEvent } from '@/app/lib/market-data';
import { format, parseISO } from 'date-fns';

interface AISidebarProps {
  selectedDayEvents: EconomicEvent[];
  selectedDate: string | null;
  weeklyEvents: EconomicEvent[];
}

export const AISidebar: React.FC<AISidebarProps> = ({ 
  selectedDayEvents, 
  selectedDate,
  weeklyEvents 
}) => {
  const [weeklyOverview, setWeeklyOverview] = useState<WeeklyOverviewOutput | null>(null);
  const [dailyAnalysis, setDailyAnalysis] = useState<DailyAnalysisOutput | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);

  useEffect(() => {
    async function fetchWeekly() {
      if (!weeklyEvents || weeklyEvents.length === 0) return;
      setLoadingWeekly(true);
      try {
        const result = await getWeeklyMarketOverview({ week: 'Current Week' });
        setWeeklyOverview(result);
      } catch (err) {
        console.error('Error fetching weekly overview:', err);
      } finally {
        setLoadingWeekly(false);
      }
    }
    fetchWeekly();
  }, [weeklyEvents]);

  useEffect(() => {
    async function fetchDaily() {
      if (!selectedDate || !selectedDayEvents || selectedDayEvents.length === 0) return;
      setLoadingDaily(true);
      try {
        const result = await getDailyMarketAnalysis({ 
          date: selectedDate, 
          events: selectedDayEvents.map(e => ({
            time: e.time,
            currency: e.currency,
            event: e.event,
            impact: e.impact,
            actual: e.actual,
            forecast: e.forecast,
            previous: e.previous
          }))
        });
        setDailyAnalysis(result);
      } catch (err) {
        console.error('Error fetching daily analysis:', err);
      } finally {
        setLoadingDaily(false);
      }
    }
    fetchDaily();
  }, [selectedDate, selectedDayEvents]);

  const SentimentIcon = ({ bias }: { bias?: string }) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Bearish': return <TrendingDown className="w-5 h-5 text-rose-400" />;
      case 'Mixed': return <Activity className="w-5 h-5 text-orange-400" />;
      default: return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="w-[420px] flex flex-col gap-6 p-6 h-[calc(100vh-80px)] overflow-y-auto bg-[#0a0c12] border-r border-white/5 scrollbar-hide">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Institutional AI</h2>
          <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">GENKIT ENGINE v1.0</p>
        </div>
      </div>

      <Card className="bg-white/[0.02] border-white/5 overflow-hidden relative shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Weekly Outlook</CardTitle>
            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black text-[9px]">
              {loadingWeekly ? '...' : `82% CONFIDENCE`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-wider">
              <span>Sentiment Intensity</span>
              <span className="text-primary">82%</span>
            </div>
            <Progress value={82} className="h-1 bg-white/5" />
          </div>

          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            {loadingWeekly ? (
              <div className="flex items-center gap-2 text-white/40">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs uppercase font-black">Analyzing...</span>
              </div>
            ) : (
              <p className="text-xs text-white/80 leading-relaxed font-medium italic">
                {weeklyOverview?.overview}
              </p>
            )}
          </div>
          
          {!loadingWeekly && weeklyOverview?.keyEvents && (
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Key Focus Areas</h4>
              <div className="grid grid-cols-1 gap-1">
                {weeklyOverview.keyEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-white/60 uppercase">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/[0.02] border-white/5 overflow-hidden relative shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Session Intelligence</CardTitle>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px]">
                LIVE
              </div>
              <SentimentIcon bias={dailyAnalysis?.marketBias} />
            </div>
          </div>
          <CardDescription className="text-[10px] font-black mt-1 uppercase tracking-tighter text-white">
            {selectedDate ? format(parseISO(selectedDate), 'MMMM dd, yyyy') : 'NO DATE SELECTED'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loadingDaily ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Synthesizing Alpha...</p>
            </div>
          ) : dailyAnalysis ? (
            <>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {dailyAnalysis.analysis}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Market Drivers</h4>
                <div className="grid grid-cols-1 gap-2">
                  {dailyAnalysis.keyFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all cursor-default">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Activity className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold text-white/80 leading-tight">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                  <p className="text-[9px] font-medium text-yellow-500/80 leading-tight">
                    HIGH VOLATILITY DETECTED: Exercise caution during NY Open sessions.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/20">
              <p className="text-xs italic font-medium">NO DATA STREAM DETECTED</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
