import { format, addDays, startOfWeek } from 'date-fns';

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

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
const impacts: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];
const eventNames = [
  'CPI m/m',
  'Non-Farm Employment Change',
  'Unemployment Rate',
  'FOMC Statement',
  'Retail Sales m/m',
  'PPI m/m',
  'Empire State Manufacturing Index',
  'Existing Home Sales',
  'Consumer Confidence',
  'GDP q/q',
];

export const getMockEvents = (date: Date): EconomicEvent[] => {
  const events: EconomicEvent[] = [];
  const baseTime = "09:00";
  
  for (let i = 0; i < 8; i++) {
    const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const randomEvent = eventNames[Math.floor(Math.random() * eventNames.length)];
    
    events.push({
      id: Math.random().toString(36).substr(2, 9),
      date: format(date, 'yyyy-MM-dd'),
      time: format(new Date(2024, 0, 1, 8 + i, Math.floor(Math.random() * 60)), 'HH:mm'),
      currency: randomCurrency,
      event: randomEvent,
      impact: randomImpact,
      actual: Math.random() > 0.5 ? (Math.random() * 5).toFixed(1) + '%' : undefined,
      forecast: (Math.random() * 5).toFixed(1) + '%',
      previous: (Math.random() * 5).toFixed(1) + '%',
    });
  }
  return events.sort((a, b) => a.time.localeCompare(b.time));
};

export const getWeeklyEvents = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekly: Record<string, EconomicEvent[]> = {};
  
  for (let i = 0; i < 5; i++) {
    const day = addDays(start, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    weekly[dayStr] = getMockEvents(day);
  }
  
  return weekly;
};