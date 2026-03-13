'use server';
/**
 * @fileOverview Weekly market overview AI agent using Genkit 1.x.
 * Analyzes the week's economic events to provide institutional narrative.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

const WeeklyEventSchema = z.object({
  date: z.string(),
  currency: z.string(),
  event: z.string(),
  impact: z.string(),
});

const WeeklyOverviewInputSchema = z.object({
  weekRange: z.string(),
  events: z.array(WeeklyEventSchema),
});
export type WeeklyOverviewInput = z.infer<typeof WeeklyOverviewInputSchema>;

const WeeklyOverviewOutputSchema = z.object({
  overview: z.string().describe('A brief summary of the expected weekly market sentiment based on scheduled data.'),
  keyEvents: z.array(z.string()).describe('Key economic events to watch during the week.'),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']).describe('Overall weekly sentiment.'),
});
export type WeeklyOverviewOutput = z.infer<typeof WeeklyOverviewOutputSchema>;

const weeklyPrompt = ai.definePrompt({
  name: 'weeklyMarketOverviewPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WeeklyOverviewInputSchema },
  output: { schema: WeeklyOverviewOutputSchema },
  prompt: `You are an Expert Macro Strategist. Analyze the following economic calendar for the week of {{weekRange}}.

Events to analyze:
{{#each events}}
- [{{date}}] {{currency}} - {{event}} (Impact: {{impact}})
{{/each}}

Focus on:
- Major central bank themes or high-impact clusters (e.g., NFP, CPI).
- How these events might shift institutional liquidity.
- Identify the most volatile days.

Provide:
1. A brief summary of expected sentiment (2-3 sentences).
2. Key events to watch.
3. Overall sentiment (Bullish, Bearish, Neutral, or Mixed).`,
});

export async function getWeeklyMarketOverview(input: WeeklyOverviewInput): Promise<WeeklyOverviewOutput> {
  try {
    const { output } = await weeklyPrompt(input);
    if (!output) throw new Error('Failed to generate weekly overview.');
    return output;
  } catch (error: any) {
    console.warn('Weekly overview fallback:', error.message);
    return {
      overview: "Weekly institutional sentiment is Neutral. Markets are pricing in current central bank policy while awaiting high-tier employment and inflation metrics.",
      keyEvents: [
        "Major Central Bank Speeches",
        "Inflation (CPI/PPI) clusters",
        "Employment (NFP) deviations"
      ],
      sentiment: "Neutral"
    };
  }
}
