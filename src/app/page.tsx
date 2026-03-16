'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { AISidebar } from '@/components/AISidebar';
import { fetchWeeklyEvents, type EconomicEvent } from '@/app/lib/market-data';
import { format, parseISO } from 'date-fns';
import { 
  Activity, 
  Loader2, 
  RefreshCcw, 
  BrainCircuit,
  CalendarDays,
  AlertCircle
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
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const data = await fetchWeeklyEvents();
      if (data && Object.keys(data).length > 0) {
        setWeeklyData(data);
        setError(null);
        
        const dates = Object.keys(data).sort();
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          setSelectedDate(dates.includes(todayStr) ? todayStr : dates[0]);
        }
      } else {
        if (Object.keys(weeklyData).length === 0) {
          setError("Establishing secure connection to market feed...");
        }
      }
    } catch (err: any) {
      console.error("SYNC_ERROR:", err);
      if (Object.keys(weeklyData).length === 0) {
        setError("Institutional feed temporarily synchronized. Check connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, weeklyData]);

  useEffect(() => {
    setIsMounted(true);
    loadData(true);
    const interval = setInterval(() => loadData(false), 30000); 
    return () => clearInterval(interval);
  }, [loadData]);

  const selectedDayEvents = useMemo(() => {
    return selectedDate ? weeklyData[selectedDate] || [] : [];
  }, [selectedDate, weeklyData]);

  const allWeeklyEvents = useMemo(() => {
    return Object.values(weeklyData).flat();
  }, [weeklyData]);

  const filteredEvents = useMemo(() => {
    let events = selectedDayEvents;
    if (impactFilter === 'High') {
      events = selectedDayEvents.filter(e => e.impact === 'High');
    }
    return events;
  }, [selectedDayEvents, impactFilter]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#1F1C21] text-foreground overflow-hidden w-full" suppressHydrationWarning>
      <Header />
      
      {/* PROTECTED CONTAINER: translate="no" prevents Google Translate from breaking React State */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative w-full notranslate" translate="no">
        
        {/* Mobile AI Analysis Trigger */}
        <div className="lg:hidden p-3 bg-[#161419] border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black uppercase text-white tracking-widest">Market IQ</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-[10px] font-black px-4 h-8 rounded-full">
                ANALYSIS
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] bg-[#1F1C21] border-white/5 p-0 rounded-t-3xl overflow-hidden">
              <AISidebar 
                selectedDayEvents={selectedDayEvents} 
                selectedDate={selectedDate} 
                weeklyEvents={allWeeklyEvents}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar Container - FIXED WIDTH */}
        <div className="hidden lg:block border-r border-white/5 shrink-0 h-full w-[400px] overflow-hidden bg-[#1F1C21]">
          <AISidebar 
            selectedDayEvents={selectedDayEvents} 
            selectedDate={selectedDate} 
            weeklyEvents={allWeeklyEvents}
          />
        </div>

        {/* Main Feed - 100% WIDTH OPTIMIZED (Removed max-w limits) */}
        <div className="flex-1 flex flex-col bg-[#161419] overflow-hidden w-full">
          <div className="p-4 lg:p-8 pb-2 shrink-0 w-full">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between border-b border-white/5 pb-6 gap-6 w-full">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Live Sync: ACTIVE
                </div>
                <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase flex flex-wrap items-center gap-3">
                  Session Feed
                  <span className="text-white/20 hidden sm:inline">/</span>
                  <span className="text-white/40 text-lg lg:text-xl font-medium tracking-normal">
                    {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMMM d') : 'Synchronizing...'}
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadData(true)}
                  disabled={loading}
                  className="h-10 px-6 border-white/10 hover:bg-white/5 bg-[#0c0e14] text-white"
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sync Live</span>
                </Button>
                <div className="flex bg-[#0c0e14] rounded-xl p-1 border border-white/5">
                  {(['All', 'High'] as const).map((impact) => (
                    <Button
                      key={impact}
                      variant="ghost"
                      size="sm"
                      onClick={() => setImpactFilter(impact)}
                      className={`h-8 px-6 text-[10px] font-black uppercase rounded-lg transition-all ${
                        impactFilter === impact ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {impact}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide w-full">
              {Object.keys(weeklyData).sort().map((dateStr) => {
                const date = parseISO(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex-1 min-w-[140px] p-4 rounded-2xl border transition-all text-left ${
                      isSelected ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-[#0c0e14] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-1.5 ${
                      isSelected ? 'text-primary' : 'text-white/40'
                    }`}>
                      {format(date, 'EEEE')}
                    </span>
                    <span className="text-sm font-black text-white">{format(date, 'MMM dd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Container - FULL WIDTH 100% */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-2 pb-32 w-full">
            <div className="bg-[#0c0e14] border border-white/5 rounded-3xl overflow-hidden shadow-2xl w-full">
              {loading && Object.keys(weeklyData).length === 0 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Establishing Secure Feed...</p>
                </div>
              ) : error ? (
                <div className="py-40 text-center text-rose-500 flex flex-col items-center gap-6">
                  <AlertCircle className="w-16 h-16 opacity-40 animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">{error}</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">TIME</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">PAIR</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">EVENT</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">VOLATILITY</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">ACTUAL</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">FORECAST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-white/[0.04] transition-all group">
                          <td className="px-8 py-6 font-mono text-xs text-white/80 tabular-nums">{event.time}</td>
                          <td className="px-8 py-6 font-black text-xs text-white uppercase tracking-tighter">{event.currency}</td>
                          <td className="px-8 py-6 font-bold text-xs text-white/90 uppercase tracking-tight">{event.event}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                              event.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                              event.impact === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {event.impact.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-xs text-emerald-400 font-bold tabular-nums">
                            {event.actual || <span className="text-white/10 opacity-50">--</span>}
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-xs text-white/40 tabular-nums">
                            {event.forecast || <span className="text-white/10 opacity-50">--</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredEvents.length === 0 && (
                    <div className="py-40 text-center text-white/10 flex flex-col items-center gap-6">
                      <CalendarDays className="w-16 h-16 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No scheduled volatility detected for this session.</p>
                    </div>
                  )}
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
