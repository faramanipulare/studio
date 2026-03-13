'use server';

/**
 * @fileOverview Institutional market data fetcher - REAL LIVE VERSION.
 * Fetches live data from ForexFactory source with ZERO caching and strict mapping.
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
  // ForexFactory live JSON feed for the current week
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?v=${timestamp}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Institutional-Bridge/1.2'
      },
    });

    if (!response.ok) {
      console.error('INSTITUTIONAL FEED OFFLINE:', response.status);
      return {};
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) return {};

    const weekly: Record<string, EconomicEvent[]> = {};
    
    // Get start of current week in Bucharest
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const mondayDate = new Date(now.setDate(diffToMonday));
    mondayDate.setHours(0, 0, 0, 0);

    rawData.forEach((item: any, index: number) => {
      try {
        if (!item.date) return;
        
        const eventDate = new Date(item.date);
        const dayKey = eventDate.toISOString().split('T')[0];

        // Format time to Bucharest (GMT+2/GMT+3)
        const timeStr = new Intl.DateTimeFormat('en-GB', { 
          timeZone: 'Europe/Bucharest', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }).format(eventDate);

        if (!weekly[dayKey]) weekly[dayKey] = [];

        weekly[dayKey].push({
          id: `live-${index}-${item.title}-${item.country}-${item.date}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          date: dayKey,
          time: timeStr,
          currency: item.country || 'USD',
          event: item.title || 'Market Event',
          impact: mapImpact(item.impact),
          // Mapping real values directly from feed properties
          actual: item.actual && item.actual.toString().trim() !== "" ? item.actual.toString().trim() : undefined,
          forecast: item.forecast && item.forecast.toString().trim() !== "" ? item.forecast.toString().trim() : undefined,
          previous: item.previous && item.previous.toString().trim() !== "" ? item.previous.toString().trim() : undefined,
        });
      } catch (e) {
        // Skip malformed entries
      }
    });

    // Sort by chronological order per day
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