"use client";

import React, { useState, useEffect } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Info, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWeeklyMarketOverview, type WeeklyMarketOverviewOutput } from '@/ai/flows/ai-weekly-market-overview-flow';
import { aiDailyMarketAnalysis, type DailyAnalysisOutput } from '@/ai/flows/ai-daily-market-analysis-flow';
import { type EconomicEvent } from '@/app/lib/mock-data';

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
      if (weeklyEvents.length === 0) return;
      setLoadingWeekly(true);
      try {
        const result = await getWeeklyMarketOverview({ economicEvents: weeklyEvents });
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
      default: return <Info className="w-5 h-5 text-secondary" />;
    }
  };

  return (
    <div className="w-[380px] flex flex-col gap-6 p-6 h-[calc(100vh-64px)] overflow-y-auto bg-card/30 border-r border-border custom-scrollbar">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-primary/20 rounded-lg">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold">AI Intelligence</h2>
      </div>

      {/* Weekly Overview */}
      <Card className="border-border bg-card/60 overflow-hidden relative">
        {loadingWeekly && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Weekly Outlook
            </CardTitle>
            <Badge variant="outline" className="text-secondary border-secondary/30">
              Confidence: {weeklyAnalysis?.successProbability ?? 0}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Success Probability</span>
              <span>{weeklyAnalysis?.successProbability ?? 0}%</span>
            </div>
            <Progress value={weeklyAnalysis?.successProbability ?? 0} className="h-2" />
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            "{weeklyAnalysis?.weeklyOutlook || 'Select a week to generate analysis...'}"
          </p>
        </CardContent>
      </Card>

      {/* Daily Analysis */}
      <Card className="border-border bg-card/60 flex-1 overflow-hidden relative">
        {loadingDaily && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedDate ? `Day Analysis (${selectedDate})` : 'Select a Day'}
            </CardTitle>
            {dailyAnalysis && (
              <BiasIcon bias={dailyAnalysis.marketBias} />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {dailyAnalysis ? (
            <>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2 uppercase">
                  <Sparkles className="w-3 h-3" />
                  Key Factors
                </h4>
                <ul className="space-y-2">
                  {dailyAnalysis.keyFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase">Summary</h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {dailyAnalysis.analysis}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Market Bias</span>
                  <span className="text-lg font-bold tracking-tight">{dailyAnalysis.marketBias}</span>
                </div>
                <div className={`p-3 rounded-lg ${
                  dailyAnalysis.marketBias === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' :
                  dailyAnalysis.marketBias === 'Bearish' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  <BiasIcon bias={dailyAnalysis.marketBias} />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <BrainCircuit className="w-12 h-12 mb-4" />
              <p className="text-sm">Click on any day from the calendar to get a deep-dive AI analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}