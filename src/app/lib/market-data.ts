import { format, addDays, startOfWeek, endOfWeek, parse } from 'date-fns';

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

const FINNHUB_KEY = "d6hh0f9r01qr5k4bu1g0d6hh0f9r01qr5k4bu1gg";

export async function fetchWeeklyEvents(): Promise<Record<string, EconomicEvent[]>> {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = addDays(start, 5); // Work week
  
  const from = format(start, 'yyyy-MM-dd');
  const to = format(end, 'yyyy-MM-dd');
  
  try {
    const response = await fetch(`https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`);
    const data = await response.json();
    
    if (!data.economicCalendar) return {};

    const weekly: Record<string, EconomicEvent[]> = {};
    
    data.economicCalendar.forEach((item: any) => {
      // Finnhub date format: "2024-03-04 15:00:00"
      const dateObj = new Date(item.time);
      const dayStr = format(dateObj, 'yyyy-MM-dd');
      const timeStr = format(dateObj, 'HH:mm');
      
      if (!weekly[dayStr]) weekly[dayStr] = [];
      
      weekly[dayStr].push({
        id: Math.random().toString(36).substr(2, 9),
        date: dayStr,
        time: timeStr,
        currency: item.currency || 'USD',
        event: item.event || 'Market Event',
        impact: mapImpact(item.impact),
        actual: item.actual?.toString(),
        forecast: item.estimate?.toString(),
        previous: item.prev?.toString(),
      });
    });

    // Sort events by time within each day
    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error) {
    console.error("Error fetching live economic calendar:", error);
    return {};
  }
}

function mapImpact(impact: string): 'Low' | 'Medium' | 'High' {
  const i = impact?.toLowerCase() || 'low';
  if (i.includes('high') || i === '3') return 'High';
  if (i.includes('med') || i === '2') return 'Medium';
  return 'Low';
}
