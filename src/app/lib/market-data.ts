import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns';

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
 * This is a highly reliable live source used by institutional traders.
 */
export async function fetchWeeklyEvents(): Promise<Record<string, EconomicEvent[]>> {
  try {
    // This feed is live and updated continuously throughout the trading week
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`Feed connection failed: ${response.status}`);

    const rawData = await response.json();
    const weekly: Record<string, EconomicEvent[]> = {};

    rawData.forEach((item: any) => {
      // Parse the ISO date string from the feed (e.g., "2024-03-20T14:30:00-04:00")
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

    // Ensure events are sorted by time for each day
    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error) {
    console.error("Critical: Live data feed unreachable.", error);
    // If the primary feed is down, we return an empty object to let the UI handle the 'No Data' state
    // instead of showing fake data.
    return {};
  }
}

function mapImpact(impact: string): 'Low' | 'Medium' | 'High' {
  const i = impact?.toLowerCase() || '';
  if (i === 'high') return 'High';
  if (i === 'medium' || i === 'med') return 'Medium';
  return 'Low';
}
