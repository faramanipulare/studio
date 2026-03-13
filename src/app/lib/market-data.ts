
'use server';

/**
 * @fileOverview Institutional market data fetcher - PRODUCTION VERSION.
 * Strictly fetches live data from ForexFactory source with ZERO caching.
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
  // STRICT CACHE BYPASS: Unique timestamp for every request
  const timestamp = Date.now();
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?v=${timestamp}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store', // Next.js 15: disable all caching
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Institutional-Bridge/1.0'
      },
    });

    if (!response.ok) {
      console.error('LIVE FEED OFFLINE:', response.status);
      return {};
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) return {};

    const weekly: Record<string, EconomicEvent[]> = {};
    
    // STRICT CURRENT WEEK CALCULATION (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    rawData.forEach((item: any, index: number) => {
      try {
        const dateObj = new Date(item.date);
        
        // FILTER: Only include events that are strictly within the current calendar week
        if (dateObj < monday || dateObj > sunday) return;

        const dayKey = dateObj.toISOString().split('T')[0];

        // TIME CONVERSION: Force Bucharest (GMT+2/GMT+3)
        const timeStr = new Intl.DateTimeFormat('en-GB', { 
          timeZone: 'Europe/Bucharest', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }).format(dateObj);

        if (!weekly[dayKey]) weekly[dayKey] = [];

        // REAL DATA MAPPING: No fallbacks, no random values
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
