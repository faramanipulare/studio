"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Clock, Zap, ShieldCheck, Volume2, VolumeX, Radio } from 'lucide-react';

export function Header() {
  const [time, setTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Google Translate Initialization
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
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
    // Set the cookie directly and reload the page.
    // This is the most stable way to trigger translation without breaking React state.
    const domain = window.location.hostname;
    const cookieValue = `/en/${lang}`;
    document.cookie = `googtrans=${cookieValue}; domain=${domain}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
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
    <header className="h-16 lg:h-20 border-b border-white/5 bg-[#1F1C21]/90 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 flex items-center justify-between notranslate" translate="no">
      <div id="google_translate_element" className="hidden"></div>
      
      <div className="flex items-center gap-3 lg:gap-5">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-[#0a0c10] border border-white/10 flex items-center justify-center shadow-2xl">
            <Zap className="text-primary w-5 h-5 lg:w-6 lg:h-6 fill-primary/20" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2">
            <h1 className="text-sm lg:text-2xl font-black tracking-tighter text-white uppercase">Fara Manipulare</h1>
            <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4 text-primary shrink-0" />
          </div>
          <p className="text-[8px] lg:text-[10px] text-primary font-black uppercase tracking-[0.2em] lg:tracking-[0.3em]">Institutional Intel</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-8">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
          <button onClick={() => changeLanguage('ro')} className="w-7 h-5 lg:w-8 lg:h-6 rounded overflow-hidden border border-white/10 hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 3 2" className="w-full h-full"><rect width="1" height="2" fill="#002B7F"/><rect width="1" height="2" x="1" fill="#FCD116"/><rect width="1" height="2" x="2" fill="#CE1126"/></svg>
          </button>
          <button onClick={() => changeLanguage('en')} className="w-7 h-5 lg:w-8 lg:h-6 rounded overflow-hidden border border-white/10 hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 60 30" className="w-full h-full"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/><path d="M30,0 v30" stroke="#C8102E" strokeWidth="6"/><path d="M0,15 h60" stroke="#C8102E" strokeWidth="6"/></svg>
          </button>
        </div>

        <button onClick={toggleRadio} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isPlaying ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>
          <Radio className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase hidden sm:inline">Pescobar FM</span>
        </button>

        <div className="hidden sm:flex flex-col items-end min-w-[140px]">
          <span className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">Bucharest Time</span>
          <span className="text-sm lg:text-lg font-mono font-black text-white">{bucharestTime}</span>
        </div>
      </div>
    </header>
  );
}
