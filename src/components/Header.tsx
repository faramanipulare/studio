"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Clock, Zap, ShieldCheck, Radio, Globe } from 'lucide-react';

export function Header() {
  const [time, setTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Inject Google Translate script safely
    if (typeof window !== 'undefined' && !document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google?.translate) {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'ro,en',
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }
    };

    return () => clearInterval(timer);
  }, []);

  const changeLanguage = (lang: 'ro' | 'en') => {
    const domain = window.location.hostname;
    const cookieValue = `/en/${lang}`;
    document.cookie = `googtrans=${cookieValue}; domain=${domain}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    // Force reload to apply language change and prevent React hydration issues
    window.location.reload();
  };

  const toggleRadio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://listen.radioking.com/radio/701141/stream/766385");
      audioRef.current.volume = 0.4;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const bucharestTime = time ? new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(time) : '--:--:--';

  return (
    <header className="h-16 lg:h-20 border-b border-white/5 bg-[#1F1C21]/95 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 flex items-center justify-between w-full">
      <div id="google_translate_element" className="hidden"></div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#0a0c10] border border-white/10 flex items-center justify-center shadow-2xl">
            <Zap className="text-primary w-6 h-6 lg:w-7 lg:h-7 fill-primary/20 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm lg:text-2xl font-black tracking-tighter text-white uppercase leading-none">Fara Manipulare</h1>
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          </div>
          <p className="text-[8px] lg:text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">Institutional Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-10">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10" translate="no">
          <button onClick={() => changeLanguage('ro')} className="w-8 h-6 lg:w-9 lg:h-6.5 rounded overflow-hidden border border-white/10 hover:opacity-100 transition-opacity opacity-70">
            <svg viewBox="0 0 3 2" className="w-full h-full"><rect width="1" height="2" fill="#002B7F"/><rect width="1" height="2" x="1" fill="#FCD116"/><rect width="1" height="2" x="2" fill="#CE1126"/></svg>
          </button>
          <button onClick={() => changeLanguage('en')} className="w-8 h-6 lg:w-9 lg:h-6.5 rounded overflow-hidden border border-white/10 hover:opacity-100 transition-opacity opacity-70">
            <svg viewBox="0 0 60 30" className="w-full h-full"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/><path d="M30,0 v30" stroke="#C8102E" strokeWidth="6"/><path d="M0,15 h60" stroke="#C8102E" strokeWidth="6"/></svg>
          </button>
        </div>

        <button onClick={toggleRadio} className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${isPlaying ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-white/40'}`}>
          <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black uppercase hidden md:inline tracking-widest">Live Stream</span>
        </button>

        <div className="hidden sm:flex flex-col items-end min-w-[160px]" translate="no">
          <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase mb-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Bucharest Time
          </span>
          <span className="text-base lg:text-xl font-mono font-black text-white tabular-nums tracking-tighter">{bucharestTime}</span>
        </div>
      </div>
    </header>
  );
}
