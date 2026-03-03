"use client";

import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export function Header() {
  const [time, setTime] = useState<Date | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("REAL-TIME");

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bucharestTime = time ? new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(time) : '--:--:--';

  return (
    <header className="h-20 border-b border-border bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-11 h-11 rounded-xl bg-[#0a0c10] border border-white/10 flex items-center justify-center shadow-2xl">
            <Zap className="text-primary w-6 h-6 fill-primary/20" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-white">
              FARA MANIPULARE
            </h1>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">
            INSTITUTIONAL INTELLIGENCE
          </p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center text-[9px] font-black text-muted-foreground gap-1.5 tracking-widest">
              <RefreshCw className="w-2.5 h-2.5 text-primary animate-spin-slow" />
              STATUS
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {lastUpdate}
            </span>
          </div>
          
          <div className="h-10 w-px bg-white/5" />

          <div className="flex flex-col items-end min-w-[140px]">
            <div className="flex items-center text-[9px] font-black text-muted-foreground gap-1.5 tracking-widest">
              <Clock className="w-2.5 h-2.5 text-primary" />
              GMT+2 BUCHAREST
            </div>
            <span className="text-lg font-mono font-black text-white tabular-nums">{bucharestTime}</span>
          </div>
        </div>
        
        <button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-lg hover:brightness-110 transition-all glow-primary shadow-xl">
          TERMINAL ACCESS
        </button>
      </div>
    </header>
  );
}
