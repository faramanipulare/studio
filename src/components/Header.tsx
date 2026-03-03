"use client";

import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, Zap } from 'lucide-react';
import { format } from 'date-fns';

export function Header() {
  const [time, setTime] = useState<Date | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("2 mins ago");

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in Bucharest timezone
  const bucharestTime = time ? new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(time) : '--:--:--';

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Fara Manipulare
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Institutional Market Analysis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="flex items-center text-xs font-semibold text-muted-foreground gap-2">
            <RefreshCw className="w-3 h-3 text-secondary animate-spin-slow" />
            LAST UPDATE
          </div>
          <span className="text-sm font-mono text-foreground">{lastUpdate}</span>
        </div>
        
        <div className="h-8 w-px bg-border" />

        <div className="flex flex-col items-end min-w-[140px]">
          <div className="flex items-center text-xs font-semibold text-muted-foreground gap-2">
            <Clock className="w-3 h-3 text-primary" />
            BUCHAREST TIME
          </div>
          <span className="text-sm font-mono font-bold text-foreground">{bucharestTime}</span>
        </div>
      </div>
    </header>
  );
}