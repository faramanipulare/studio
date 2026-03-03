import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  currency: string;
  event: string;
  impact: 'Low' | 'Medium' | 'High';
  actual?: string;
  forecast?: string;
  previous?: string;
  impact_percentage?: number;
  sentiment?: string;
}

interface EconomicCalendarProps {
  events: EconomicEvent[];
  isLoading?: boolean;
}

export const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ events, isLoading }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" title="Bullish" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" title="Bearish" />;
      default: return <Minus className="w-4 h-4 text-slate-400" title="Neutral" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white/70">Economic Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/70">Economic Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
                    <Badge variant="outline" className="text-[10px] font-bold bg-white/5">
                      {event.currency}
                    </Badge>
                    <span className="text-xs font-medium text-white/90">{event.event}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.impact_percentage !== undefined && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">Volatility</span>
                        <span className="text-[10px] font-mono font-bold text-white">{event.impact_percentage}%</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-muted-foreground uppercase font-bold">Bias</span>
                      {getSentimentIcon(event.sentiment)}
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-black ${getImpactColor(event.impact)}`}>
                      {event.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {(event.actual || event.forecast || event.previous) && (
                  <div className="flex gap-4 pt-1 border-t border-white/5">
                    {event.actual && (
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">Actual</span>
                        <span className="text-[10px] font-mono text-white">{event.actual}</span>
                      </div>
                    )}
                    {event.forecast && (
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">Forecast</span>
                        <span className="text-[10px] font-mono text-white/50">{event.forecast}</span>
                      </div>
                    )}
                    {event.previous && (
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">Previous</span>
                        <span className="text-[10px] font-mono text-white/50">{event.previous}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-xs">No scheduled events found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
