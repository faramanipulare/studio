'use server';

/**
 * @fileOverview Institutional market data fetcher - REAL TIME.
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
  const cacheBuster = Date.now();
  // Using cache: no-store to ensure 'Actual' values are live.
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?v=${cacheBuster}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) throw new Error(`FF_API_SYNC_FAILED: ${response.status}`);

    const rawData = await response.json();
    if (!Array.isArray(rawData)) return {};

    const weekly: Record<string, EconomicEvent[]> = {};

    rawData.forEach((item: any, index: number) => {
      if (!item.date || !item.title) return;
      
      const eventDate = new Date(item.date);
      const dayKey = eventDate.toISOString().split('T')[0];

      const timeStr = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Europe/Bucharest', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).format(eventDate);

      if (!weekly[dayKey]) weekly[dayKey] = [];

      weekly[dayKey].push({
        id: `ev-${index}-${item.country}-${item.date}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        date: dayKey,
        time: timeStr,
        currency: item.country || 'USD',
        event: item.title || 'Market Event',
        impact: mapImpact(item.impact),
        // Ensure values are strings or undefined
        actual: (item.actual !== undefined && item.actual !== null && String(item.actual).trim() !== "") ? String(item.actual) : undefined,
        forecast: (item.forecast !== undefined && item.forecast !== null && String(item.forecast).trim() !== "") ? String(item.forecast) : undefined,
        previous: (item.previous !== undefined && item.previous !== null && String(item.previous).trim() !== "") ? String(item.previous) : undefined,
      });
    });

    return weekly;
  } catch (error) {
    console.error("CRITICAL_INSTITUTIONAL_SYNC_ERROR:", error);
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
