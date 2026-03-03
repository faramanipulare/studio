'use server';

import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  impact_percentage?: number;
};

const BUCHAREST_TZ = 'Europe/Bucharest';

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
      // The feed date is usually in UTC or has an offset
      // e.g., "2024-03-21T14:00:00-04:00"
      const dateUtc = parseISO(item.date);
      const zonedDate = toZonedTime(dateUtc, BUCHAREST_TZ);
      
      const dayKey = format(zonedDate, 'yyyy-MM-dd');
      const timeStr = format(zonedDate, 'HH:mm');

      if (!weekly[dayKey]) weekly[dayKey] = [];

      weekly[dayKey].push({
        id: `${item.title}-${item.date}-${item.country}`.replace(/\s+/g, '-').toLowerCase(),
        date: dayKey,
        time: timeStr,
        currency: item.country || 'USD',
        event: item.title || 'Market Event',
        impact: mapImpact(item.impact),
        actual: item.actual || undefined,
        forecast: item.forecast || undefined,
        previous: item.previous || undefined,
        // Calculate mock sentiment and impact based on the event's impact level
        sentiment: item.impact === 'High' ? (Math.random() > 0.5 ? 'Bullish' : 'Bearish') : 'Neutral',
        impact_percentage: item.impact === 'High' ? Math.floor(Math.random() * 40 + 60) : 
                           item.impact === 'Medium' ? Math.floor(Math.random() * 30 + 30) : 
                           Math.floor(Math.random() * 30)
      });
    });

    // Sort by time within each day
    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error) {
    console.error("Critical: Live data feed unreachable server-side.", error);
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
