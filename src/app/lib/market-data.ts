
'use server';

/**
 * @fileOverview Institutional market data fetcher - PRODUCTION VERSION.
 * Fetches live data from ForexFactory source with ZERO caching and strict real data mapping.
 */

export type EconomicEvent = {
  id: string;
  time: string;
  date: string;
  currency: string;
  event: string;
  impact: 'Low' | 'Medium' | 'High' | 'Holiday';
  actual?: string;
  forecast?: string;
  previous?: string;
};

export async function fetchWeeklyEvents(): Promise<Record<string, EconomicEvent[]>> {
  const timestamp = Date.now();
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?v=${timestamp}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Institutional-Bridge/1.1'
      },
    });

    if (!response.ok) {
      console.error('LIVE FEED OFFLINE:', response.status);
      return {};
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) return {};

    const weekly: Record<string, EconomicEvent[]> = {};
    
    rawData.forEach((item: any, index: number) => {
      try {
        if (!item.date) return;
        const dateObj = new Date(item.date);
        const dayKey = dateObj.toISOString().split('T')[0];

        // Force Bucharest (GMT+2/GMT+3)
        const timeStr = new Intl.DateTimeFormat('en-GB', { 
          timeZone: 'Europe/Bucharest', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }).format(dateObj);

        if (!weekly[dayKey]) weekly[dayKey] = [];

        weekly[dayKey].push({
          id: `live-${index}-${item.title}-${item.country}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          date: dayKey,
          time: timeStr,
          currency: item.country || 'USD',
          event: item.title || 'Market Event',
          impact: mapImpact(item.impact),
          actual: item.actual && item.actual.trim() !== "" ? item.actual.trim() : undefined,
          forecast: item.forecast && item.forecast.trim() !== "" ? item.forecast.trim() : undefined,
          previous: item.previous && item.previous.trim() !== "" ? item.previous.trim() : undefined,
        });
      } catch (e) {
        // Skip malformed entries
      }
    });

    // Sort by chronological order
    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error) {
    console.error("CRITICAL SYNC ERROR:", error);
    return {};
  }
}

function mapImpact(impact: string): 'Low' | 'Medium' | 'High' | 'Holiday' {
  const i = impact?.toLowerCase() || '';
  if (i === 'high') return 'High';
  if (i === 'medium' || i === 'med') return 'Medium';
  if (i === 'holiday') return 'Holiday';
  return 'Low';
}
