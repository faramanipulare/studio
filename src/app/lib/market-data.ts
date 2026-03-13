'use server';

/**
 * @fileOverview Institutional market data fetcher - PRODUCTION VERSION.
 * Fetches real-time data from ForexFactory source with strict cache bypassing.
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
  // Using a robust URL with timestamp to force fresh data from source
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?v=${timestamp}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0'
      },
    });

    if (!response.ok) {
      console.error("FF Feed Error Status:", response.status);
      return {};
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error("FF Feed Format Error: Expected array");
      return {};
    }

    const weekly: Record<string, EconomicEvent[]> = {};

    rawData.forEach((item: any, index: number) => {
      try {
        if (!item.date || !item.title) return;
        
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

        // Map ACTUAL, FORECAST and PREVIOUS strictly from source
        weekly[dayKey].push({
          id: `live-${index}-${item.country || 'USD'}-${item.date}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          date: dayKey,
          time: timeStr,
          currency: item.country || 'USD',
          event: item.title || 'Market Event',
          impact: mapImpact(item.impact),
          actual: item.actual ? item.actual.toString().trim() : undefined,
          forecast: item.forecast ? item.forecast.toString().trim() : undefined,
          previous: item.previous ? item.previous.toString().trim() : undefined,
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
    console.error("INSTITUTIONAL SYNC ERROR:", error);
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
