
'use server';
/**
 * @fileOverview Daily market analysis AI agent using Genkit 1.x.
 * 
 * Persona: Expert Institutional Analyst.
 * Goal: Identify potential session bias and liquidity zones.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

const DailyAnalysisEventSchema = z.object({
  time: z.string(),
  currency: z.string(),
  event: z.string(),
  impact: z.string(),
  actual: z.string().optional(),
  forecast: z.string().optional(),
  previous: z.string().optional(),
});

const DailyAnalysisInputSchema = z.object({
  date: z.string(),
  events: z.array(DailyAnalysisEventSchema),
});
export type DailyAnalysisInput = z.infer<typeof DailyAnalysisInputSchema>;

const DailyAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A concise institutional analysis of the day\'s session.'),
  keyFactors: z.array(z.string()).describe('List of key institutional factors influencing the market.'),
  marketBias: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']).describe('The overall market bias for the day.'),
});
export type DailyAnalysisOutput = z.infer<typeof DailyAnalysisOutputSchema>;

const dailyPrompt = ai.definePrompt({
  name: 'aiDailyMarketAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: DailyAnalysisInputSchema },
  output: { schema: DailyAnalysisOutputSchema },
  prompt: `You are an Elite Institutional Analyst specializing in Smart Money Concepts (SMC). 
Analyze the economic calendar for {{date}}.

Consider:
- How high-impact news acts as liquidity inducement.
- Likely session volatility (London vs New York).
- Market sentiment based on actual vs forecast deviations.

Provide:
1. A concise analysis (3-4 sentences) focusing on institutional liquidity shifts.
2. 3-4 volatile factors to watch (e.g., "NFP Deviation", "USD Liquidity Grab").
3. A clear market bias (Bullish, Bearish, Neutral, or Mixed).

Events for {{date}}:
{{#each events}}
- [{{time}}] {{currency}} - {{event}} (Impact: {{impact}}) | Act: {{actual}}, Est: {{forecast}}, Prev: {{previous}}
{{/each}}

Focus on the "Why" behind the price action potential.`,
});

export async function getDailyMarketAnalysis(input: DailyAnalysisInput): Promise<DailyAnalysisOutput> {
  try {
    const { output } = await dailyPrompt(input);
    if (!output) throw new Error('No output from prompt');
    return output;
  } catch (error: any) {
    console.warn('Daily analysis fallback (likely quota limit):', error.message);
    return {
      analysis: "Session bias remains Neutral. Institutional liquidity is consolidating around key daily highs/lows. Monitor high-impact G7 news releases for volatility expansion.",
      keyFactors: [
        "Consolidation at previous day equilibrium",
        "Awaiting high-impact news catalyst",
        "Monitor session opens for liquidity sweeps"
      ],
      marketBias: "Neutral"
    };
  }
}
