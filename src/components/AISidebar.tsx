'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
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
        const result = await getWeeklyMarketOverview({ week: 'Current Session' });
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
    <div className="w-full lg:w-[420px] flex flex-col gap-6 p-4 lg:p-6 h-full lg:h-screen overflow-y-auto bg-[#1F1C21] border-r border-white/5 lg:border-r-0 pb-32">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Market Intelligence</h2>
            <p className="text-[8px] text-primary font-black uppercase tracking-widest mt-0.5">INSTITUTIONAL CORE</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black text-white/40 uppercase">LIVE FEED</span>
        </div>
      </div>

      {/* Weekly Outlook Card */}
      <Card className="bg-white/[0.02] border-white/5 overflow-hidden relative shadow-2xl shrink-0">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Institutional Outlook</CardTitle>
            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black text-[9px]">
              {loadingWeekly ? 'Analyzing...' : `WEEKLY`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-wider">
              <span>Sentiment Intensity</span>
              <span className="text-primary">82%</span>
            </div>
            <Progress value={82} className="h-1 bg-white/5" />
          </div>

          <div className="p-4 rounded-xl bg-[#0c0e14] border border-white/5 relative">
            {loadingWeekly ? (
              <div className="flex items-center justify-center py-4 gap-3 text-white/40">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-[10px] uppercase font-black tracking-widest">Processing...</span>
              </div>
            ) : (
              <p className="text-xs text-white/80 leading-relaxed font-medium italic">
                {weeklyOverview?.overview}
              </p>
            )}
          </div>
          
          {!loadingWeekly && weeklyOverview?.keyEvents && (
            <div className="space-y-2 pb-2">
              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Strategic Focus</h4>
              <div className="grid grid-cols-1 gap-1.5">
                {weeklyOverview.keyEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-white/70 uppercase leading-tight">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Analysis Card */}
      <Card className="bg-white/[0.02] border-white/5 overflow-hidden relative shadow-2xl shrink-0">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Session IQ</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[8px] uppercase">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
              <SentimentIcon bias={dailyAnalysis?.marketBias} />
            </div>
          </div>
          <CardDescription className="text-[10px] font-black mt-1 uppercase tracking-widest text-white/80">
            {selectedDate ? format(parseISO(selectedDate), 'MMMM dd, yyyy') : 'Awaiting Selection...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {loadingDaily ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Synthesizing Alpha...</p>
            </div>
          ) : dailyAnalysis ? (
            <>
              <div className="p-4 rounded-xl bg-[#0c0e14] border border-white/5">
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {dailyAnalysis.analysis}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Volatile Vectors</h4>
                <div className="grid grid-cols-1 gap-2">
                  {dailyAnalysis.keyFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-white/80 leading-snug">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 pb-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-[9px] font-black text-yellow-500/90 leading-snug uppercase tracking-tight">
                    Institutional Alert: Liquidity shifts expected.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/10 space-y-2">
              <Activity className="w-8 h-8 mx-auto opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Select a day to begin...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
