"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';

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
        setNews(data.slice(0, 10));
      } catch (error) {
        console.error('Error fetching market news:', error);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-card border-t border-border overflow-hidden z-50">
      <div className="relative flex items-center h-full">
        <div className="bg-primary px-4 h-full flex items-center z-10 font-semibold text-xs whitespace-nowrap">
          <TrendingUp className="w-3 h-3 mr-2" />
          LIVE MARKET NEWS
        </div>
        <div className="animate-ticker">
          {[...news, ...news].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center px-6 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <span className="text-secondary font-medium mr-2">[{item.source}]</span>
              {item.headline}
              <div className="mx-4 h-1 w-1 rounded-full bg-muted-foreground/30" />
            </div>
          ))}
          {news.length === 0 && (
            <div className="px-6 text-xs text-muted-foreground italic">Fetching latest market insights...</div>
          )}
        </div>
      </div>
    </div>
  );
}