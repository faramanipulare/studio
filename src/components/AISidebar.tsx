"use client";

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, TrendingUp, TrendingDown, Minus, Activity, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeeklyMarketOverview, type WeeklyOverviewOutput } from '@/ai/flows/ai-weekly-market-overview-flow';
import { getDailyMarketAnalysis, type DailyAnalysisOutput } from '@/ai/flows/ai-daily-market-analysis-flow';
import { type EconomicEvent } from '@/app/lib/market-data';

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

  // Weekly Narrative Sync
  useEffect(() => {
    async function fetchWeekly() {
      if (!weeklyEvents || weeklyEvents.length === 0) return;
      setLoadingWeekly(true);
      try {
        const result = await getWeeklyMarketOverview({ 
          weekRange: 'Current Trading Week',
          events: weeklyEvents.slice(0, 40).map(e => ({
            date: e.date,
            currency: e.currency,
            event: e.event,
            impact: e.impact
          }))
        });
        setWeeklyOverview(result);
      } catch (err) {
        console.warn('AI Weekly Narrative Sync Delay');
      } finally {
        setLoadingWeekly(false);
      }
    }
    fetchWeekly();
  }, [weeklyEvents]);

  // Daily Analysis Sync
  useEffect(() => {
    async function fetchDaily() {
      if (!selectedDate || !selectedDayEvents || selectedDayEvents.length === 0) {
        setDailyAnalysis(null);
        return;
      }
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
        console.warn('AI Daily IQ Sync Delay');
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
    <div className="flex flex-col h-full bg-[#1F1C21] overflow-hidden notranslate" translate="no">
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Market Intelligence</h2>
            <p className="text-[8px] text-primary font-black uppercase mt-0.5 tracking-widest">LIVE SMC FEED</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">SECURE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-32">
        {/* Weekly Narrative */}
        <Card className="bg-white/[0.02] border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Weekly Narrative</CardTitle>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black text-[9px]">
                {loadingWeekly ? 'SYNCING...' : `ACTIVE`}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="p-4 rounded-xl bg-[#0c0e14] border border-white/5">
              {loadingWeekly ? (
                <div className="flex items-center justify-center py-4 gap-3 text-white/40">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Synthesizing...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-white/80 leading-relaxed font-medium italic">
                    {weeklyOverview?.overview || "Synchronizing with institutional narrative..."}
                  </p>
                  {weeklyOverview?.keyEvents && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[8px] font-black text-primary uppercase mb-2 tracking-widest">Macro Watchlist</p>
                      <ul className="space-y-1">
                        {weeklyOverview.keyEvents.map((ev, idx) => (
                          <li key={idx} className="text-[10px] text-white/50">• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Session IQ */}
        <Card className="bg-white/[0.02] border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Daily Session IQ</CardTitle>
              {loadingDaily ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <SentimentIcon bias={dailyAnalysis?.marketBias} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {loadingDaily ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Analyzing Session...</p>
              </div>
            ) : dailyAnalysis ? (
              <>
                <div className="p-4 rounded-xl bg-[#0c0e14] border border-white/5">
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {dailyAnalysis.analysis}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Session Volatility Factors</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {dailyAnalysis.keyFactors.map((factor, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-white/80 leading-snug">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest">Select a day with events for session analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
