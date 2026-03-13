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
  BrainCircuit,
  CalendarDays
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

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWeeklyEvents();
      setWeeklyData(data);
      
      const dates = Object.keys(data).sort();
      if (dates.length > 0) {
        // Find today or first available
        const todayStr = new Date().toISOString().split('T')[0];
        if (dates.includes(todayStr)) {
          setSelectedDate(todayStr);
        } else if (!selectedDate || !dates.includes(selectedDate)) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err: any) {
      console.error("Live Sync Error (Handled):", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // 5 min auto-refresh
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
      events = selectedDayEvents.filter(e => e.impact === 'High');
    }
    return events;
  }, [selectedDayEvents, impactFilter]);

  if (loading && Object.keys(weeklyData).length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1F1C21] text-foreground font-body">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
            Establishing Institutional Bridge...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1F1C21] text-foreground font-body overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile Market IQ Drawer */}
        <div className="lg:hidden p-3 bg-[#161419] border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black uppercase text-white tracking-widest">Market IQ</span>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-[10px] font-black px-4 h-8 rounded-full">
                GENERATE ANALYSIS
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] bg-[#1F1C21] border-white/5 p-0 rounded-t-3xl overflow-hidden">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto my-4" />
              <div className="h-full overflow-hidden">
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
        <div className="hidden lg:block border-r border-white/5 shrink-0 h-full w-[420px] overflow-hidden">
          <AISidebar 
            selectedDayEvents={selectedDayEvents} 
            selectedDate={selectedDate} 
            weeklyEvents={flatWeeklyEvents}
          />
        </div>

        {/* Main Feed Container */}
        <div className="flex-1 flex flex-col bg-[#161419] overflow-hidden">
          <div className="p-4 lg:p-6 pb-2 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Live Sync Status: {Object.keys(weeklyData).length > 0 ? 'Nominal' : 'Connecting...'}
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase">
                  Session Feed
                  <span className="text-white/20 mx-2">/</span>
                  <span className="text-white/40 text-sm font-medium tracking-normal">
                    {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMM d') : 'Live...'}
                  </span>
                </h2>
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
                  <span className="text-[9px] font-black uppercase">Sync</span>
                </Button>
                <div className="flex bg-[#0c0e14] rounded-lg p-0.5 border border-white/5">
                  {(['All', 'High'] as const).map((impact) => (
                    <Button
                      key={impact}
                      variant="ghost"
                      size="sm"
                      onClick={() => setImpactFilter(impact)}
                      className={`h-7 px-4 text-[9px] font-black uppercase rounded-md transition-all ${
                        impactFilter === impact ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {impact}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Day Selector */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-2 mt-4">
              {Object.keys(weeklyData).sort().map((dateStr) => {
                const date = parseISO(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-2 lg:p-3 rounded-xl border transition-all text-left ${
                      isSelected ? 'bg-primary/10 border-primary/50' : 'bg-[#0c0e14] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase tracking-widest block mb-1 ${
                      isSelected ? 'text-primary' : 'text-white/40'
                    }`}>
                      {format(date, 'EEE')}
                    </span>
                    <span className="text-xs lg:text-sm font-black text-white">{format(date, 'MMM dd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Economic Calendar Table - Protected from Google Translate mutators */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0 pb-32 custom-scrollbar">
            <div 
              className="bg-[#0c0e14] border border-white/5 rounded-2xl overflow-hidden shadow-2xl notranslate" 
              translate="no"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">TIME</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">PAIR</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">EVENT</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">VOLATILITY</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">ACTUAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5 font-mono text-xs text-white/80">{event.time}</td>
                        <td className="px-6 py-5 font-bold text-xs text-white">{event.currency}</td>
                        <td className="px-6 py-5 font-bold text-xs text-white/90 truncate max-w-[200px]">{event.event}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-[11px] font-mono font-bold ${event.impact === 'High' ? 'text-rose-400' : 'text-white/40'}`}>
                            {event.impact_percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-xs text-emerald-400 font-bold whitespace-nowrap">
                          {event.actual ? event.actual : <span className="text-white/10 opacity-30">--</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEvents.length === 0 && (
                <div className="py-20 text-center text-white/10 flex flex-col items-center gap-4">
                  <CalendarDays className="w-12 h-12 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No scheduled volatility synced for this session.</p>
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