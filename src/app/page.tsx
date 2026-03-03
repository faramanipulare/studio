"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { AISidebar } from '@/components/AISidebar';
import { getWeeklyEvents, type EconomicEvent } from '@/app/lib/mock-data';
import { format, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const weeklyData = useMemo(() => getWeeklyEvents(), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(Object.keys(weeklyData)[0] || null);
  const [impactFilter, setImpactFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const selectedDayEvents = selectedDate ? weeklyData[selectedDate] : null;
  const flatWeeklyEvents = Object.values(weeklyData).flat();

  const filteredEvents = useMemo(() => {
    if (!selectedDayEvents) return [];
    if (impactFilter === 'All') return selectedDayEvents;
    return selectedDayEvents.filter(e => e.impact === impactFilter);
  }, [selectedDayEvents, impactFilter]);

  const ImpactBadge = ({ impact }: { impact: string }) => {
    const colors = {
      High: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    };
    return (
      <Badge variant="outline" className={`${colors[impact as keyof typeof colors]} px-2 py-0 h-5 text-[10px] font-bold uppercase`}>
        {impact}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar for AI Analysis */}
        <AISidebar 
          selectedDayEvents={selectedDayEvents} 
          selectedDate={selectedDate} 
          weeklyEvents={flatWeeklyEvents}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 gap-6 bg-[#171419] overflow-y-auto pb-20">
          {/* Week Overview Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Economic Calendar
              </h3>
              <div className="flex bg-card rounded-lg p-1 border border-border">
                {['All', 'High', 'Medium', 'Low'].map((impact) => (
                  <Button
                    key={impact}
                    variant="ghost"
                    size="sm"
                    onClick={() => setImpactFilter(impact as any)}
                    className={`h-7 px-3 text-[10px] font-bold uppercase rounded-md transition-all ${
                      impactFilter === impact 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {impact}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Object.keys(weeklyData).map((dateStr) => {
                const date = parseISO(dateStr);
                const isSelected = selectedDate === dateStr;
                const highImpactCount = weeklyData[dateStr].filter(e => e.impact === 'High').length;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-4 rounded-xl border transition-all text-left relative group ${
                      isSelected 
                        ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                        : 'bg-card/50 border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      {format(date, 'EEEE')}
                    </span>
                    <span className="block text-lg font-bold">
                      {format(date, 'MMM dd')}
                    </span>
                    {highImpactCount > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-rose-500 uppercase">
                          {highImpactCount} Critical
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 rounded-2xl bg-card/40 border border-border overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-muted/10 border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-tight">
                Market Schedule - {selectedDate ? format(parseISO(selectedDate), 'PPPP') : 'Loading...'}
              </h4>
              <span className="text-xs text-muted-foreground font-medium">
                {filteredEvents.length} Events Listed
              </span>
            </div>
            
            <div className="divide-y divide-border/50">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center px-6 py-4 hover:bg-muted/20 transition-colors group cursor-default"
                  >
                    <div className="w-16 flex flex-col items-center justify-center border-r border-border/50 mr-6 py-1">
                      <span className="text-xs font-mono font-bold text-foreground">{event.time}</span>
                    </div>
                    
                    <div className="w-16 mr-6">
                      <div className="flex items-center justify-center px-2 py-1 rounded bg-muted/40 text-[10px] font-bold border border-border">
                        {event.currency}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {event.event}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <ImpactBadge impact={event.impact} />
                      </div>
                    </div>

                    <div className="flex items-center gap-8 min-w-[300px] justify-end">
                      <div className="flex flex-col items-end w-20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Actual</span>
                        <span className={`text-sm font-mono ${event.actual ? 'text-white' : 'text-muted-foreground/30'}`}>
                          {event.actual || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end w-20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Forecast</span>
                        <span className="text-sm font-mono text-muted-foreground">{event.forecast || '---'}</span>
                      </div>
                      <div className="flex flex-col items-end w-20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Previous</span>
                        <span className="text-sm font-mono text-muted-foreground">{event.previous || '---'}</span>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-muted group-hover:bg-primary/20 transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center text-muted-foreground opacity-50">
                  <Info className="w-12 h-12 mb-4" />
                  <p>No economic events found for the selected filters.</p>
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