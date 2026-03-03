'use server';

import { format, parseISO } from 'date-fns';

export type EconomicEvent = {
  id: string;
  time: string;
  date: string;
  currency: string;
  event: string;
  impact: 'Low' | 'Medium' | 'High';
  actual?: string;
  forecast?: string;
  previous?: string;
};

/**
 * Fetches real-time economic calendar data from the ForexFactory (Faireconomy) feed.
 * This runs on the server to bypass CORS restrictions.
 */
export async function fetchWeeklyEvents(): Promise<Record<string, EconomicEvent[]>> {
  try {
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Feed connection failed: ${response.status}`);

    const rawData = await response.json();
    const weekly: Record<string, EconomicEvent[]> = {};

    rawData.forEach((item: any) => {
      const dateObj = parseISO(item.date);
      const dayKey = format(dateObj, 'yyyy-MM-dd');
      const timeStr = format(dateObj, 'HH:mm');

      if (!weekly[dayKey]) weekly[dayKey] = [];

      weekly[dayKey].push({
        id: Math.random().toString(36).substring(2, 11),
        date: dayKey,
        time: timeStr,
        currency: item.country || 'USD',
        event: item.title || 'Market Event',
        impact: mapImpact(item.impact),
        actual: item.actual || undefined,
        forecast: item.forecast || undefined,
        previous: item.previous || undefined,
      });
    });

    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error) {
    console.error("Critical: Live data feed unreachable server-side.", error);
    return {};
  }
}

function mapImpact(impact: string): 'Low' | 'Medium' | 'High' {
  const i = impact?.toLowerCase() || '';
  if (i === 'high') return 'High';
  if (i === 'medium' || i === 'med') return 'Medium';
  return 'Low';
}
