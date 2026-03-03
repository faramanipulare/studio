"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Clock, RefreshCw, Zap, ShieldCheck, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [time, setTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Initialize Radio
    audioRef.current = new Audio("https://listen.radioking.com/radio/701141/stream/766385");
    audioRef.current.volume = 0.5;

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleRadio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.warn("Autoplay blocked:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const bucharestTime = time ? new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(time) : '--:--:--';

  return (
    <header className="h-16 lg:h-20 border-b border-border bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3 lg:gap-5">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-[#0a0c10] border border-white/10 flex items-center justify-center shadow-2xl">
            <Zap className="text-primary w-5 h-5 lg:w-6 lg:h-6 fill-primary/20" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 lg:gap-2">
            <h1 className="text-sm lg:text-2xl font-black tracking-tighter text-white truncate">
              FARA MANIPULARE
            </h1>
            <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4 text-primary shrink-0" />
          </div>
          <p className="text-[8px] lg:text-[10px] text-primary font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] truncate">
            INSTITUTIONAL INTEL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-10">
        <div className="flex items-center gap-4 lg:gap-10">
          {/* Radio Toggle */}
          <button 
            onClick={toggleRadio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isPlaying 
                ? 'bg-primary/20 border-primary text-primary animate-pulse' 
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Pescobar FM</span>
            {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center text-[8px] lg:text-[9px] font-black text-muted-foreground gap-1.5 tracking-widest">
              <RefreshCw className="w-2.5 h-2.5 text-primary animate-spin-slow" />
              STATUS
            </div>
            <span className="text-[10px] lg:text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE FEED
            </span>
          </div>
          
          <div className="hidden sm:block h-8 lg:h-10 w-px bg-white/5" />

          <div className="flex flex-col items-end min-w-[80px] lg:min-w-[140px]">
            <div className="flex items-center text-[8px] lg:text-[9px] font-black text-muted-foreground gap-1.5 tracking-widest uppercase">
              <Clock className="w-2.5 h-2.5 text-primary" />
              <span className="hidden lg:inline">GMT+2 BUCHAREST</span>
              <span className="lg:hidden">RO TIME</span>
            </div>
            <span className="text-sm lg:text-lg font-mono font-black text-white tabular-nums">{bucharestTime}</span>
          </div>
        </div>
        
        <button className="hidden md:block bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-lg hover:brightness-110 transition-all glow-primary shadow-xl">
          TERMINAL ACCESS
        </button>
      </div>
    </header>
  );
}