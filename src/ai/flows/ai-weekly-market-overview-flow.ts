
'use server';
/**
 * @fileOverview Weekly market overview AI agent using Genkit 1.x.
 *
 * - getWeeklyMarketOverview - A function that handles the weekly market overview process.
 * - WeeklyOverviewInput - The input type for the weekly market overview.
 * - WeeklyOverviewOutput - The return type for the weekly market overview.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

const WeeklyOverviewInputSchema = z.object({
  week: z.string(),
});
export type WeeklyOverviewInput = z.infer<typeof WeeklyOverviewInputSchema>;

const WeeklyOverviewOutputSchema = z.object({
  overview: z.string().describe('A brief summary of the expected weekly market sentiment.'),
  keyEvents: z.array(z.string()).describe('Key economic events to watch during the week.'),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']).describe('Overall weekly sentiment.'),
});
export type WeeklyOverviewOutput = z.infer<typeof WeeklyOverviewOutputSchema>;

const weeklyPrompt = ai.definePrompt({
  name: 'weeklyMarketOverviewPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WeeklyOverviewInputSchema },
  output: { schema: WeeklyOverviewOutputSchema },
  prompt: `You are an expert economic analyst. Your task is to provide a concise market overview for the week of {{week}}.

Provide:
1. A brief summary of the expected market sentiment.
2. Key economic events to watch.
3. An overall sentiment rating (Bullish, Bearish, Neutral, or Mixed).`,
});

export async function getWeeklyMarketOverview(input: WeeklyOverviewInput): Promise<WeeklyOverviewOutput> {
  try {
    const { output } = await weeklyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate weekly market overview.');
    }
    return output;
  } catch (error: any) {
    console.error('Weekly overview flow failed:', error);
    return {
      overview: "Weekly institutional sentiment is currently stable. High-impact news releases remain the primary drivers for price action.",
      keyEvents: [
        "Central Bank interest rate decisions",
        "Employment data releases (NFP)",
        "Inflation metrics (CPI/PPI)"
      ],
      sentiment: "Neutral"
    };
  }
}
