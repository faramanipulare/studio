
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { AISidebar } from '@/components/AISidebar';
import { fetchWeeklyEvents, type EconomicEvent } from '@/app/lib/market-data';
import { format, parseISO } from 'date-fns';
import { 
  Activity, 
  Loader2, 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const [weeklyData, setWeeklyData] = useState<Record<string, EconomicEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWeeklyEvents();
      setWeeklyData(data);
      
      const dates = Object.keys(data).sort();
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      if (dates.includes(todayStr)) {
        setSelectedDate(todayStr);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      console.error("Failed to sync live data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDayEvents = useMemo(() => {
    return selectedDate ? weeklyData[selectedDate] || [] : [];
  }, [selectedDate, weeklyData]);

  const flatWeeklyEvents = useMemo(() => {
    return Object.values(weeklyData).flat();
  }, [weeklyData]);

  const filteredEvents = useMemo(() => {
    let events = selectedDayEvents;
    if (impactFilter !== 'All') {
      events = selectedDayEvents.filter(e => e.impact === impactFilter);
    }
    return events;
  }, [selectedDayEvents, impactFilter]);

  const getDaySummary = (events: EconomicEvent[]) => {
    if (!events.length) return { avgImpact: 0, mainSentiment: 'Neutral' };
    const avgImpact = Math.round(events.reduce((acc, curr) => acc + (curr.impact_percentage || 0), 0) / events.length);
    const sentiments = events.map(e => e.sentiment).filter(Boolean);
    const counts = sentiments.reduce((acc: any, curr: any) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    const mainSentiment = Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b, 'Neutral');
    return { avgImpact, mainSentiment };
  };

  const SentimentIndicator = ({ sentiment }: { sentiment?: string }) => {
    if (sentiment === 'Bullish') return <TrendingUp className="w-4 h-4 text-emerald-400" title="Bullish" />;
    if (sentiment === 'Bearish') return <TrendingDown className="w-4 h-4 text-rose-400" title="Bearish" />;
    if (sentiment === 'Mixed') return <Activity className="w-4 h-4 text-orange-400" title="Mixed" />;
    return <Minus className="w-4 h-4 text-slate-500" title="Neutral" />;
  };

  if (loading && Object.keys(weeklyData).length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1F1C21] text-foreground font-body">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
            Establishing Server Bridge to Market Feeds...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1F1C21] text-foreground font-body overflow-hidden">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        <AISidebar 
          selectedDayEvents={selectedDayEvents} 
          selectedDate={selectedDate} 
          weeklyEvents={flatWeeklyEvents}
        />

        <div className="flex-1 flex flex-col p-6 gap-6 bg-[#161419] overflow-y-auto pb-24">
          <div className="flex items-end justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                <Activity className="w-3 h-3 animate-pulse" />
                Institutional Data Feed
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                Global Economic Calendar
                <span className="text-white/20 font-light text-xl">/</span>
                <span className="text-white/60 text-sm font-medium tracking-normal">
                  {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMMM d') : 'Selecting Session...'}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadData}
                disabled={loading}
                className="h-8 px-4 border-white/10 hover:bg-white/5 bg-transparent text-white"
              >
                <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-black uppercase">Sync Live Data</span>
              </Button>
              <div className="flex bg-[#0c0e14] rounded-lg p-0.5 border border-white/5">
                {['All', 'High', 'Medium', 'Low'].map((impact) => (
                  <Button
                    key={impact}
                    variant="ghost"
                    size="sm"
                    onClick={() => setImpactFilter(impact as any)}
                    className={`h-7 px-3 text-[9px] font-black uppercase rounded-md transition-all ${
                      impactFilter === impact 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {impact}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.keys(weeklyData).sort().map((dateStr) => {
              const date = parseISO(dateStr);
              const isSelected = selectedDate === dateStr;
              const dayEvents = weeklyData[dateStr];
              const { avgImpact, mainSentiment } = getDaySummary(dayEvents);
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`group p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/20' 
                      : 'bg-[#0c0e14] border-white/5 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col relative z-10">
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                      isSelected ? 'text-primary' : 'text-white/40'
                    }`}>
                      {format(date, 'EEEE')}
                    </span>
                    <span className="text-xl font-black tracking-tighter text-white">
                      {format(date, 'MMM dd')}
                    </span>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <div 
                              key={idx} 
                              className={`w-2 h-2 rounded-full border border-[#050508] ${
                                e.impact === 'High' ? 'bg-red-500' : e.impact === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-white/40 uppercase">
                          {dayEvents.length} Events
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-md">
                        <span className="text-[10px] font-bold text-primary">{avgImpact}%</span>
                        <SentimentIndicator sentiment={mainSentiment} />
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <div className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-[#0c0e14] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Time</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Currency</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Event</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Impact %</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Sentiment</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actual</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Forecast</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-white/80">{event.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-4 bg-white/5 rounded-sm flex items-center justify-center text-[10px] font-bold text-white/60">
                          {event.currency.substring(0, 2)}
                        </span>
                        <span className="font-bold text-xs text-white">{event.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-xs text-white">{event.event}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-mono text-white/60">{event.impact_percentage}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <SentimentIndicator sentiment={event.sentiment} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-emerald-400 font-bold">{event.actual || '-'}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-white/40">{event.forecast || '-'}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-white/20">{event.previous || '-'}</td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-white/40 text-xs italic font-medium">
                      NO HIGH IMPACT DATA DETECTED FOR THIS SESSION
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <NewsTicker />
    </div>
  );
}
