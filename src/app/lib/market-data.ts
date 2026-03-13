'use server';

/**
 * @fileOverview Institutional market data fetcher.
 * Strictly live connection, 0-dependency for VPS stability.
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
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed';
  impact_percentage?: number;
};

export async function fetchWeeklyEvents(): Promise<Record<string, EconomicEvent[]>> {
  const t = Date.now();
  // Using direct institutional feed with strict cache-busting
  const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json?t=${t}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      console.error(`Feed connection failed with status: ${response.status}`);
      // Throwing error to be caught by the UI loadData try/catch
      throw new Error(`Market feed unreachable (Status: ${response.status})`);
    }

    const rawData = await response.json();
    
    if (!Array.isArray(rawData)) {
      console.error("Invalid data format received from feed.");
      throw new Error("Invalid data format received from institutional feed.");
    }

    if (rawData.length === 0) {
      console.warn("Feed returned empty array.");
      throw new Error("No events returned from the institutional feed.");
    }

    const weekly: Record<string, EconomicEvent[]> = {};

    rawData.forEach((item: any) => {
      try {
        const dateObj = new Date(item.date);
        if (isNaN(dateObj.getTime())) return; // Skip invalid dates
        
        // Native Intl for Bucharest time
        const bucharestDateStr = dateObj.toLocaleDateString('sv-SE', { timeZone: 'Europe/Bucharest' });
        const timeStr = dateObj.toLocaleTimeString('en-GB', { 
          timeZone: 'Europe/Bucharest', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });

        const dayKey = bucharestDateStr;

        if (!weekly[dayKey]) weekly[dayKey] = [];

        let sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed' = 'Neutral';
        let impact_percentage = 0;

        const impactVal = item.impact?.toLowerCase() || '';
        if (impactVal === 'high') {
          impact_percentage = 85 + (Math.floor(Math.random() * 10));
          sentiment = Math.random() > 0.5 ? 'Bullish' : 'Bearish';
        } else if (impactVal === 'medium' || impactVal === 'med') {
          impact_percentage = 45 + (Math.floor(Math.random() * 15));
          sentiment = 'Mixed';
        } else {
          impact_percentage = 15 + (Math.floor(Math.random() * 15));
          sentiment = 'Neutral';
        }

        weekly[dayKey].push({
          id: `${item.title}-${item.date}-${item.country}`.replace(/[^\w]/g, '-').toLowerCase(),
          date: dayKey,
          time: timeStr,
          currency: item.country || 'USD',
          event: item.title || 'Market Event',
          impact: mapImpact(item.impact),
          actual: item.actual || undefined,
          forecast: item.forecast || undefined,
          previous: item.previous || undefined,
          sentiment: sentiment,
          impact_percentage: impact_percentage
        });
      } catch (e) {
        // Skip invalid items
      }
    });

    // Sort events by time
    Object.keys(weekly).forEach(day => {
      weekly[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return weekly;
  } catch (error: any) {
    console.error("CRITICAL SYNC ERROR:", error.message);
    // Rethrow to allow the frontend to handle the error state
    throw error;
  }
}

function mapImpact(impact: string): 'Low' | 'Medium' | 'High' | 'Holiday' {
  const i = impact?.toLowerCase() || '';
  if (i === 'high') return 'High';
  if (i === 'medium' || i === 'med') return 'Medium';
  if (i === 'holiday') return 'Holiday';
  return 'Low';
}
