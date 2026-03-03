'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing daily market analysis.
 *
 * - aiDailyMarketAnalysis - A function that handles the daily market analysis process.
 * - DailyAnalysisInput - The input type for the aiDailyMarketAnalysis function.
 * - DailyAnalysisOutput - The return type for the aiDailyMarketAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyAnalysisEventSchema = z.object({
  time: z.string().describe('The time of the economic event in Bucharest, Romania time.'),
  currency: z.string().describe('The currency affected by the event (e.g., USD, EUR).'),
  event: z.string().describe('The name of the economic event.'),
  impact: z.enum(['Low', 'Medium', 'High']).describe('The expected impact level of the event.'),
  actual: z.string().optional().nullable().describe('The actual value of the economic indicator.'),
  forecast: z.string().optional().nullable().describe('The forecasted value of the economic indicator.'),
  previous: z.string().optional().nullable().describe('The previous value of the economic indicator.'),
});

const DailyAnalysisInputSchema = z.object({
  date: z.string().describe('The date for which to provide the daily market analysis (e.g., "2024-07-26").'),
  events: z.array(DailyAnalysisEventSchema).describe('A list of economic calendar events for the specified day.'),
});
export type DailyAnalysisInput = z.infer<typeof DailyAnalysisInputSchema>;

const DailyAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A concise analysis of the day\'s economic implications.'),
  keyFactors: z.array(z.string()).describe('An array of key factors that will influence the market.'),
  marketBias: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']).describe('A potential market bias for the day.'),
});
export type DailyAnalysisOutput = z.infer<typeof DailyAnalysisOutputSchema>;

export async function aiDailyMarketAnalysis(input: DailyAnalysisInput): Promise<DailyAnalysisOutput> {
  try {
    return await aiDailyMarketAnalysisFlow(input);
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        analysis: "Daily analysis is currently unavailable due to API rate limits. Please try again later.",
        keyFactors: ["API Rate Limit Exceeded"],
        marketBias: "Neutral"
      };
    }
    throw error;
  }
}

const aiDailyMarketAnalysisPrompt = ai.definePrompt({
  name: 'aiDailyMarketAnalysisPrompt',
  input: { schema: DailyAnalysisInputSchema },
  output: { schema: DailyAnalysisOutputSchema },
  prompt: `You are an expert economic analyst. Your task is to analyze the provided economic calendar events for the day {{{date}}} and provide a concise analysis, key factors, and a market bias.

Economic Events for {{{date}}}:
{{#each events}}
- Time: {{time}}, Currency: {{currency}}, Event: {{event}}, Impact: {{impact}}, Actual: {{actual}}, Forecast: {{forecast}}, Previous: {{previous}}
{{/each}}

Based on these events, provide:
1. A concise analysis of the day's economic implications.
2. The key factors that will influence the market.
3. A potential market bias for the day. Ensure the market bias is one of 'Bullish', 'Bearish', 'Neutral', or 'Mixed'.`,
});

const aiDailyMarketAnalysisFlow = ai.defineFlow(
  {
    name: 'aiDailyMarketAnalysisFlow',
    inputSchema: DailyAnalysisInputSchema,
    outputSchema: DailyAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await aiDailyMarketAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate daily market analysis.');
    }
    return output;
  }
);
