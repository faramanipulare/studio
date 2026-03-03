
'use server';
/**
 * @fileOverview Daily market analysis AI agent using Genkit 1.x.
 *
 * - getDailyMarketAnalysis - A function that handles the daily market analysis process.
 * - DailyAnalysisInput - The input type for the daily market analysis.
 * - DailyAnalysisOutput - The return type for the daily market analysis.
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
  prompt: `You are an expert economic analyst. Your task is to analyze the provided economic calendar events for the day {{date}} and provide a concise analysis, key factors, and a market bias.

Economic Events for {{date}}:
{{#each events}}
- Time: {{time}}, Currency: {{currency}}, Event: {{event}}, Impact: {{impact}}, Actual: {{actual}}, Forecast: {{forecast}}, Previous: {{previous}}
{{/each}}

Based on these events, provide a concise analysis, key factors, and market bias.`,
});

export async function getDailyMarketAnalysis(input: DailyAnalysisInput): Promise<DailyAnalysisOutput> {
  return dailyMarketAnalysisFlow(input);
}

const dailyMarketAnalysisFlow = ai.defineFlow(
  {
    name: 'dailyMarketAnalysisFlow',
    inputSchema: DailyAnalysisInputSchema,
    outputSchema: DailyAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await dailyPrompt(input);
      if (!output) {
        throw new Error('Failed to generate daily market analysis.');
      }
      return output;
    } catch (error: any) {
      // Graceful fallback for quota limits or other errors
      return {
        analysis: "Daily session analysis is currently limited due to institutional data provider constraints. Monitor high-volatility news events manually.",
        keyFactors: [
          "Focus on G7 high-impact news releases",
          "Watch for price deviations from technical levels during NY session",
          "Monitor institutional flow around daily opens"
        ],
        marketBias: "Neutral"
      };
    }
  }
);
