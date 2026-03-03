
'use server';
/**
 * @fileOverview Daily market analysis AI agent using Genkit 1.x.
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
  analysis: z.string().describe('A concise analysis of the day\'s economic implications.'),
  keyFactors: z.array(z.string()).describe('List of key factors influencing the market.'),
  marketBias: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']).describe('The overall market bias for the day.'),
});
export type DailyAnalysisOutput = z.infer<typeof DailyAnalysisOutputSchema>;

const dailyPrompt = ai.definePrompt({
  name: 'aiDailyMarketAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: DailyAnalysisInputSchema },
  output: { schema: DailyAnalysisOutputSchema },
  prompt: `You are an expert economic analyst specializing in institutional flows. Analyze the provided economic calendar events for the day {{date}}.

Provide:
1. A concise analysis (3-4 sentences) of the day's economic implications.
2. 3-4 key volatile factors.
3. A clear market bias (Bullish, Bearish, Neutral, or Mixed).

Economic Events for {{date}}:
{{#each events}}
- [{{time}}] {{currency}} - {{event}} (Impact: {{impact}}) | Act: {{actual}}, Est: {{forecast}}, Prev: {{previous}}
{{/each}}

Focus on how these events influence institutional liquidity and potential session bias.`,
});

export async function getDailyMarketAnalysis(input: DailyAnalysisInput): Promise<DailyAnalysisOutput> {
  try {
    const { output } = await dailyPrompt(input);
    if (!output) throw new Error('No output from prompt');
    return output;
  } catch (error: any) {
    console.warn('Daily analysis fallback triggered:', error.message);
    return {
      analysis: "Daily session bias is currently neutral. Monitor high-volatility news events manually as session dynamics adjust to institutional liquidity shifts.",
      keyFactors: [
        "Focus on G7 high-impact news releases",
        "Watch for price deviations from technical levels during NY session",
        "Monitor institutional flow around daily opens"
      ],
      marketBias: "Neutral"
    };
  }
}
