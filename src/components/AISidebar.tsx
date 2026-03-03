"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Info, Sparkles, Loader2, Target, BarChart3, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWeeklyMarketOverview, type WeeklyMarketOverviewOutput } from '@/ai/flows/ai-weekly-market-overview-flow';
import { aiDailyMarketAnalysis, type DailyAnalysisOutput } from '@/ai/flows/ai-daily-market-analysis-flow';
import { type EconomicEvent } from '@/app/lib/market-data';
import { format, parseISO } from 'date-fns';

interface AISidebarProps {
  selectedDayEvents: EconomicEvent[] | null;
  selectedDate: string | null;
  weeklyEvents: EconomicEvent[];
}

export function AISidebar({ selectedDayEvents, selectedDate, weeklyEvents }: AISidebarProps) {
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyMarketOverviewOutput | null>(null);
  const [dailyAnalysis, setDailyAnalysis] = useState<DailyAnalysisOutput | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);
  
  const lastProcessedDate = useRef<string | null>(null);
  const lastWeeklyEventCount = useRef<number>(0);

  // Strategic Weekly Outlook Flow
  useEffect(() => {
    const fetchWeekly = async () => {
      if (!weeklyEvents || weeklyEvents.length === 0 || weeklyEvents.length === lastWeeklyEventCount.current) return;
      
      setLoadingWeekly(true);
      lastWeeklyEventCount.current = weeklyEvents.length;
      
      try {
        const relevantEvents = weeklyEvents.filter(e => e.impact !== 'Low');
        const result = await getWeeklyMarketOverview({ 
          economicEvents: relevantEvents.length > 0 ? relevantEvents.slice(0, 20) : weeklyEvents.slice(0, 15) 
        });
        setWeeklyAnalysis(result);
      } catch (error) {
        console.error("Macro Analysis Link Error:", error);
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [weeklyEvents]);

  // Session-Specific Deep Dive Flow
  useEffect(() => {
    const fetchDaily = async () => {
      if (!selectedDayEvents || !selectedDate || selectedDate === lastProcessedDate.current) return;
      
      setLoadingDaily(true);
      lastProcessedDate.current = selectedDate;
      setDailyAnalysis(null); // Clear previous for better UI feedback
      
      try {
        const result = await aiDailyMarketAnalysis({ 
          date: selectedDate, 
          events: selectedDayEvents.map(e => ({
            time: e.time,
            currency: e.currency,
            event: e.event,
            impact: e.impact as any,
            actual: e.actual,
            forecast: e.forecast,
            previous: e.previous
          })) 
        });
        setDailyAnalysis(result);
      } catch (error) {
        console.error("Session Analysis Link Error:", error);
        lastProcessedDate.current = null; // Allow retry on next interaction
      } finally {
        setLoadingDaily(false);
      }
    };
    fetchDaily();
  }, [selectedDayEvents, selectedDate]);

  const BiasIcon = ({ bias }: { bias: string }) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Bearish': return <TrendingDown className="w-5 h-5 text-rose-400" />;
      case 'Neutral': return <Minus className="w-5 h-5 text-slate-400" />;
      case 'Mixed': return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="w-[420px] flex flex-col gap-6 p-6 h-[calc(100vh-80px)] overflow-y-auto bg-[#0a0c12] border-r border-white/5 custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Institutional AI</h2>
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">GEMINI 2.5 FLASH PRO / TERMINAL</p>
          </div>
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.01] overflow-hidden relative shadow-2xl rounded-2xl">
        {loadingWeekly && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">Aggregating Macro Sentiment...</span>
            </div>
          </div>
        )}
        <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Strategic Weekly Outlook
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black text-[9px] px-2 py-0.5">
              {weeklyAnalysis?.successProbability ?? 0}% CONFIDENCE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-5 flex flex-col gap-5">
          <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-wider">
              <span>Forecast Accuracy Index</span>
              <span className="text-primary">{weeklyAnalysis?.successProbability ?? 0}%</span>
            </div>
            <Progress value={weeklyAnalysis?.successProbability ?? 0} className="h-1 bg-white/5" />
          </div>
          <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 min-h-[80px]">
            <p className="text-xs text-foreground/80 leading-relaxed font-bold italic">
              {weeklyAnalysis?.weeklyOutlook ? `"${weeklyAnalysis.weeklyOutlook}"` : 'Awaiting live exchange feed to generate macro analysis...'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-white/[0.01] flex-1 overflow-hidden relative flex flex-col shadow-2xl rounded-2xl">
        {loadingDaily && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">Scanning Session Parameters...</span>
            </div>
          </div>
        )}
        <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Session Intelligence
              </CardTitle>
              <p className="text-[10px] font-black mt-1 uppercase tracking-tighter text-white">
                {selectedDate ? format(parseISO(selectedDate), 'MMMM dd, yyyy') : 'Terminal Idle'}
              </p>
            </div>
            {dailyAnalysis && (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <BiasIcon bias={dailyAnalysis.marketBias} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {dailyAnalysis ? (
            <>
              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-primary flex items-center gap-2 uppercase tracking-widest">
                  <Target className="w-3 h-3" />
                  Primary Sentiment Drivers
                </h4>
                <ul className="space-y-2">
                  {dailyAnalysis.keyFactors.map((factor, i) => (
                    <li key={i} className="text-[11px] text-white/70 flex items-start gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5 group hover:border-primary/30 transition-colors">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_5px_rgba(var(--primary),0.5)]" />
                      <span className="font-bold uppercase tracking-tight">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Institutional Consensus
                </h4>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                    {dailyAnalysis.analysis}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 flex items-center justify-between shadow-xl mt-auto">
                <div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Operational Bias</span>
                  <span className={`text-2xl font-black tracking-tighter ${
                    dailyAnalysis.marketBias === 'Bullish' ? 'text-emerald-400' :
                    dailyAnalysis.marketBias === 'Bearish' ? 'text-red-400' :
                    dailyAnalysis.marketBias === 'Mixed' ? 'text-orange-400' :
                    'text-white'
                  }`}>
                    {dailyAnalysis.marketBias.toUpperCase()}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl shadow-2xl ${
                  dailyAnalysis.marketBias === 'Bullish' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                  dailyAnalysis.marketBias === 'Bearish' ? 'bg-red-500/10 border border-red-500/20' :
                  'bg-white/5 border border-white/10'
                }`}>
                  <BiasIcon bias={dailyAnalysis.marketBias} />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
              <Sparkles className="w-12 h-12 mb-4 text-primary animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
                Terminal online. Awaiting session selection to initiate deep dive analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
