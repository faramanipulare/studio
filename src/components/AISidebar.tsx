"use client";

import React, { useState, useEffect } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Info, Sparkles, Loader2, Target, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWeeklyMarketOverview, type WeeklyMarketOverviewOutput } from '@/ai/flows/ai-weekly-market-overview-flow';
import { aiDailyMarketAnalysis, type DailyAnalysisOutput } from '@/ai/flows/ai-daily-market-analysis-flow';
import { type EconomicEvent } from '@/app/lib/market-data';

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

  useEffect(() => {
    const fetchWeekly = async () => {
      if (!weeklyEvents || weeklyEvents.length === 0) return;
      setLoadingWeekly(true);
      try {
        // Limit to high/medium impact for cleaner AI focus
        const relevantEvents = weeklyEvents.filter(e => e.impact !== 'Low');
        const result = await getWeeklyMarketOverview({ 
          economicEvents: relevantEvents.length > 0 ? relevantEvents : weeklyEvents.slice(0, 15) 
        });
        setWeeklyAnalysis(result);
      } catch (error) {
        console.error("Weekly Analysis Error:", error);
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [weeklyEvents]);

  useEffect(() => {
    const fetchDaily = async () => {
      if (!selectedDayEvents || !selectedDate) return;
      setLoadingDaily(true);
      try {
        const result = await aiDailyMarketAnalysis({ 
          date: selectedDate, 
          events: selectedDayEvents.map(e => ({
            ...e,
            impact: e.impact as any
          })) 
        });
        setDailyAnalysis(result);
      } catch (error) {
        console.error("Daily Analysis Error:", error);
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
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="w-[420px] flex flex-col gap-6 p-6 h-[calc(100vh-80px)] overflow-y-auto bg-[#0a0c12] border-r border-border/60 custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Institutional AI</h2>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">GEMINI 2.5 FLASH PRO</p>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <Card className="border-border/40 bg-white/[0.02] overflow-hidden relative shadow-2xl">
        {loadingWeekly && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[8px] font-black uppercase tracking-widest">Scanning Weekly Macro...</span>
            </div>
          </div>
        )}
        <CardHeader className="pb-4 border-b border-border/20 bg-white/[0.01]">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Strategic Outlook
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black text-[10px]">
              {weeklyAnalysis?.successProbability ?? 0}% PROBABILITY
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-5 flex flex-col gap-5">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              <span>Volatility Variance</span>
              <span className="text-primary">{weeklyAnalysis?.successProbability ?? 0}%</span>
            </div>
            <Progress value={weeklyAnalysis?.successProbability ?? 0} className="h-1.5 bg-white/5" />
          </div>
          <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-foreground/80 leading-relaxed font-medium italic">
              "{weeklyAnalysis?.weeklyOutlook || 'Aggregating live economic data for macro analysis...'}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Analysis */}
      <Card className="border-border/40 bg-white/[0.02] flex-1 overflow-hidden relative flex flex-col shadow-2xl">
        {loadingDaily && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[8px] font-black uppercase tracking-widest">Processing Data Points...</span>
            </div>
          </div>
        )}
        <CardHeader className="pb-4 border-b border-border/20 bg-muted/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Session Deep Dive
              </CardTitle>
              <p className="text-xs font-bold mt-1 uppercase tracking-tighter">{selectedDate || 'Awaiting Session Selection'}</p>
            </div>
            {dailyAnalysis && (
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <BiasIcon bias={dailyAnalysis.marketBias} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {dailyAnalysis ? (
            <>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-widest">
                  <Target className="w-3 h-3" />
                  Primary Bias Drivers
                </h4>
                <ul className="space-y-3">
                  {dailyAnalysis.keyFactors.map((factor, i) => (
                    <li key={i} className="text-xs text-foreground/70 flex items-start gap-3 bg-white/[0.01] p-2.5 rounded-lg border border-white/5 group hover:bg-white/[0.03] transition-colors">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                      <span className="font-medium">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Institutional Consensus
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  {dailyAnalysis.analysis}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Current Bias</span>
                  <span className={`text-xl font-black tracking-tighter ${
                    dailyAnalysis.marketBias === 'Bullish' ? 'text-emerald-400' :
                    dailyAnalysis.marketBias === 'Bearish' ? 'text-red-400' :
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
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
              <Sparkles className="w-12 h-12 mb-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                Connect to live session data to initiate institutional analysis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
