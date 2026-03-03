"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, Globe, ExternalLink } from 'lucide-react';

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const apiKey = "d6hh0f9r01qr5k4bu1g0d6hh0f9r01qr5k4bu1gg";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
        const data = await response.json();
        setNews(data.slice(0, 15));
      } catch (error) {
        console.error('Error fetching market news:', error);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#050508] border-t border-white/5 overflow-hidden z-50 flex items-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
      <div className="bg-primary px-5 h-full flex items-center z-20 font-black text-[10px] tracking-widest text-white shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)]">
        <Globe className="w-3.5 h-3.5 mr-2" />
        LIVE WIRE
      </div>
      <div className="flex-1 relative flex items-center overflow-hidden h-full">
        <div className="animate-ticker flex items-center">
          {[...news, ...news].map((item, idx) => (
            <a 
              key={`${item.id}-${idx}`} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-8 text-[10px] font-bold text-muted-foreground hover:text-white transition-all whitespace-nowrap group"
            >
              <span className="text-primary mr-3 font-black tabular-nums">[{new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
              <span className="uppercase tracking-tight">{item.headline}</span>
              <span className="mx-4 text-white/10 font-black">/</span>
              <span className="text-[9px] text-white/20 uppercase tracking-tighter group-hover:text-primary transition-colors">{item.source}</span>
              <ExternalLink className="w-2.5 h-2.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
          {news.length === 0 && (
            <div className="px-8 text-[10px] text-muted-foreground font-bold animate-pulse uppercase tracking-widest">
              Establishing secure connection to global market feed...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
