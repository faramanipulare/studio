"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { AISidebar } from '@/components/AISidebar';
import { fetchWeeklyEvents, type EconomicEvent } from '@/app/lib/market-data';
import { format, parseISO } from 'date-fns';
import { Activity, Layers, Zap, Loader2, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    if (impactFilter === 'All') return selectedDayEvents;
    return selectedDayEvents.filter(e => e.impact === impactFilter);
  }, [selectedDayEvents, impactFilter]);

  const ImpactBadge = ({ impact }: { impact: string }) => {
    const styles = {
      High: 'bg-red-500/10 text-red-400 border-red-500/20',
      Medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return (
      <Badge variant="outline" className={`${styles[impact as keyof typeof styles]} px-1.5 py-0 h-4 text-[9px] font-black uppercase tracking-tighter`}>
        {impact}
      </Badge>
    );
  };

  if (loading && Object.keys(weeklyData).length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#050508] text-foreground font-body">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
            Connecting to Live Exchange Feeds...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050508] text-foreground font-body overflow-hidden">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        <AISidebar 
          selectedDayEvents={selectedDayEvents} 
          selectedDate={selectedDate} 
          weeklyEvents={flatWeeklyEvents}
        />

        <div className="flex-1 flex flex-col p-6 gap-6 bg-[#08090d] overflow-y-auto pb-24">
          <div className="flex items-end justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                <Activity className="w-3 h-3 animate-pulse" />
                Live Terminal Feed
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Global Economic Calendar
                <span className="text-muted-foreground/30 font-light text-xl">/</span>
                <span className="text-muted-foreground text-sm font-medium tracking-normal">
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
              <div className="flex bg-muted/20 rounded-lg p-0.5 border border-white/5">
                {['All', 'High', 'Medium', 'Low'].map((impact) => (
                  <Button
                    key={impact}
                    variant="ghost"
                    size="sm"
                    onClick={() => setImpactFilter(impact as any)}
                    className={`h-7 px-3 text-[9px] font-black uppercase rounded-md transition-all ${
                      impactFilter === impact 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {impact}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {Object.keys(weeklyData).sort().map((dateStr) => {
              const date = parseISO(dateStr);
              const isSelected = selectedDate === dateStr;
              const dayEvents = weeklyData[dateStr];
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`group p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/20' 
                      : 'bg-[#0c0e14] border-white/5 hover:bg-[#12141c] hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col relative z-10">
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {format(date, 'EEEE')}
                    </span>
                    <span className="text-xl font-black tracking-tighter text-white">
                      {format(date, 'MMM dd')}
                    </span>
                    
                    <div className="mt-3 flex items-center gap-2">
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
                      <span className="text-[9px] font-black text-muted-foreground uppercase">
                        {dayEvents.length} Events
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Zap className="w-12 h-12 text-primary fill-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0c0e14] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  Institutional Schedule (GMT+2)
                </h4>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[9px]">
                {filteredEvents.length} ACTIVE LIVE EVENTS
              </Badge>
            </div>
            
            <div className="divide-y divide-white/[0.03]">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center px-6 py-5 hover:bg-primary/[0.03] transition-colors group cursor-default"
                  >
                    <div className="w-20 border-r border-white/5 mr-6">
                      <span className="text-sm font-mono font-black text-white tabular-nums">{event.time}</span>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-tighter">TIME</p>
                    </div>
                    
                    <div className="w-14 mr-6">
                      <div className="flex items-center justify-center h-8 rounded bg-white/5 text-[10px] font-black border border-white/10 text-white group-hover:border-primary/50 transition-colors">
                        {event.currency}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">
                        {event.event}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <ImpactBadge impact={event.impact} />
                      </div>
                    </div>

                    <div className="flex items-center gap-10 min-w-[340px] justify-end">
                      <div className="flex flex-col items-end w-24">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Actual</span>
                        <span className={`text-sm font-mono font-black tabular-nums ${
                          event.actual 
                            ? 'text-emerald-400'
                            : 'text-white/10'
                        }`}>
                          {event.actual || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end w-24">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Forecast</span>
                        <span className="text-sm font-mono font-black text-white/40 tabular-nums">
                          {event.forecast || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end w-24">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Previous</span>
                        <span className="text-sm font-mono font-black text-white/20 tabular-nums">
                          {event.previous || '---'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-30">
                  <Activity className="w-12 h-12 mb-4 text-primary animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No live volatility events for this session.</p>
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
