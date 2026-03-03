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
  BrainCircuit,
  CalendarDays,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [weeklyData, setWeeklyData] = useState<Record<string, EconomicEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<'All' | 'High'>('All');
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Force fetch fresh data bypassing browser cache
      const data = await fetchWeeklyEvents();
      setWeeklyData(data);
      setLastSync(format(new Date(), 'HH:mm:ss'));
      
      const dates = Object.keys(data).sort();
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      if (!selectedDate) {
        if (dates.includes(todayStr)) {
          setSelectedDate(todayStr);
        } else if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      console.error("Failed to sync live data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
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
    const mainSentiment = Object.keys(counts).length > 0 
      ? Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b)
      : 'Neutral';
    return { avgImpact, mainSentiment };
  };

  const SentimentIndicator = ({ sentiment }: { sentiment?: string }) => {
    if (sentiment === 'Bullish') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (sentiment === 'Bearish') return <TrendingDown className="w-4 h-4 text-rose-400" />;
    if (sentiment === 'Mixed') return <Activity className="w-4 h-4 text-orange-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse px-4 text-center">
            Synchronizing Institutional Session Feeds...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1F1C21] text-foreground font-body overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Header Controls */}
        <div className="lg:hidden p-3 bg-[#161419] border-b border-white/5 sticky top-0 z-30 backdrop-blur-md flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black uppercase text-white tracking-widest">Institutional IQ</span>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-[10px] font-black px-4 h-8 rounded-full shadow-lg shadow-primary/20">
                OPEN ANALYSIS
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] bg-[#1F1C21] border-white/5 p-0 rounded-t-[2rem] flex flex-col">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4 shrink-0" />
              <div className="flex-1 overflow-y-auto pb-10">
                <AISidebar 
                  selectedDayEvents={selectedDayEvents} 
                  selectedDate={selectedDate} 
                  weeklyEvents={flatWeeklyEvents}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r border-white/5 shrink-0 h-full">
          <AISidebar 
            selectedDayEvents={selectedDayEvents} 
            selectedDate={selectedDate} 
            weeklyEvents={flatWeeklyEvents}
          />
        </div>

        {/* Main Feed Content */}
        <div className="flex-1 flex flex-col bg-[#161419] overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 lg:p-6 pb-2 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Real-Time Schedule
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white flex flex-col sm:flex-row sm:items-center gap-2">
                  Institutional Calendar
                  <span className="text-white/20 hidden sm:inline">/</span>
                  <span className="text-white/40 text-sm font-medium tracking-normal">
                    {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMM d') : 'Awaiting Selection'}
                  </span>
                </h2>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                  <Clock className="w-2.5 h-2.5" />
                  Last Sync: {lastSync || 'Initializing...'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={loading}
                  className="h-8 px-3 border-white/10 hover:bg-white/5 bg-[#0c0e14] text-white"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-black uppercase">Refresh</span>
                </Button>
                <div className="flex bg-[#0c0e14] rounded-lg p-0.5 border border-white/5">
                  {(['All', 'High'] as const).map((impact) => (
                    <Button
                      key={impact}
                      variant="ghost"
                      size="sm"
                      onClick={() => setImpactFilter(impact)}
                      className={`h-7 px-4 text-[9px] font-black uppercase rounded-md transition-all ${
                        impactFilter === impact 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {impact}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Selector - Mobile Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              {Object.keys(weeklyData).sort().map((dateStr) => {
                const date = parseISO(dateStr);
                const isSelected = selectedDate === dateStr;
                const dayEvents = weeklyData[dateStr];
                const { avgImpact, mainSentiment } = getDaySummary(dayEvents);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`group p-3 lg:p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/20' 
                        : 'bg-[#0c0e14] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col relative z-10">
                      <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                        isSelected ? 'text-primary' : 'text-white/40'
                      }`}>
                        {format(date, 'EEEE')}
                      </span>
                      <span className="text-sm lg:text-xl font-black tracking-tight text-white">
                        {format(date, 'MMM dd')}
                      </span>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          <span className="text-[9px] font-bold text-primary">{avgImpact}%</span>
                          <SentimentIndicator sentiment={mainSentiment} />
                        </div>
                        <span className="text-[8px] font-black text-white/20 uppercase">
                          {dayEvents.length} E
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Events Container */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0">
            <div className="bg-[#0c0e14] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-20">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">GMT+2</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Pair</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Event</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Impact</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Bias</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actual</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Forecast</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5 font-mono text-xs text-white/80">{event.time}</td>
                        <td className="px-6 py-5 font-bold text-xs text-white">{event.currency}</td>
                        <td className="px-6 py-5 font-bold text-xs text-white truncate max-w-[200px]">{event.event}</td>
                        <td className="px-6 py-5 text-center">
                           <span className={`text-[11px] font-mono font-bold ${event.impact === 'High' ? 'text-rose-400' : 'text-white/60'}`}>
                             {event.impact_percentage}%
                           </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <SentimentIndicator sentiment={event.sentiment} />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-xs text-emerald-400 font-bold">{event.actual || '--'}</td>
                        <td className="px-6 py-5 text-right font-mono text-xs text-white/30">{event.forecast || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-primary">{event.time}</span>
                          <span className="text-[10px] font-black text-white">{event.currency}</span>
                        </div>
                        <p className="text-xs font-bold text-white leading-tight">{event.event}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <SentimentIndicator sentiment={event.sentiment} />
                        <span className={`text-[10px] font-black ${event.impact === 'High' ? 'text-rose-400' : 'text-white/30'}`}>
                          {event.impact_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase">Act</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">{event.actual || '--'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase">Est</span>
                        <span className="text-[10px] font-mono text-white/40">{event.forecast || '--'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase">Prev</span>
                        <span className="text-[10px] font-mono text-white/20">{event.previous || '--'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="py-20 text-center text-white/20 flex flex-col items-center gap-2">
                  <CalendarDays className="w-10 h-10 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No scheduled volatility events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <NewsTicker />
    </div>
  );
}