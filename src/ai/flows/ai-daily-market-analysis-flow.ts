'use server';

import { ai, geminiModel } from '../genkit';
import { z } from 'genkit';

const DailyAnalysisEventSchema = z.object({
  time: z.string().optional(),
  currency: z.string().optional(),
  event: z.string().optional(),
  impact: z.string().optional(),
  actual: z.string().optional().nullable(),
  forecast: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
});

const DailyAnalysisInputSchema = z.object({
  date: z.string(),
  events: z.array(DailyAnalysisEventSchema),
});

export type DailyAnalysisInput = z.infer<typeof DailyAnalysisInputSchema>;

const DailyAnalysisOutputSchema = z.object({
  analysis: z.string(),
  keyFactors: z.array(z.string()),
  marketBias: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']),
});

export type DailyAnalysisOutput = z.infer<typeof DailyAnalysisOutputSchema>;

const aiDailyMarketAnalysisPrompt = ai.definePrompt({
  name: 'aiDailyMarketAnalysisPrompt',
  model: geminiModel,
  input: { schema: DailyAnalysisInputSchema },
  output: { schema: DailyAnalysisOutputSchema },
  prompt: `You are an expert economic analyst. Your task is to analyze the provided economic calendar events for the day {{date}} and provide a concise analysis, key factors, and a market bias.

Economic Events for {{date}}:
{{#each events}}
- Time: {{time}}, Currency: {{currency}}, Event: {{event}}, Impact: {{impact}}, Actual: {{actual}}, Forecast: {{forecast}}, Previous: {{previous}}
{{/each}}

Based on these events, provide:
1. A concise analysis of the day's economic implications.
2. The key factors that will influence the market.
3. A potential market bias for the day. Ensure the market bias is one of 'Bullish', 'Bearish', 'Neutral', or 'Mixed'.`,
});

export async function getDailyMarketAnalysis(input: DailyAnalysisInput): Promise<DailyAnalysisOutput> {
  try {
    const { output } = await aiDailyMarketAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate daily market analysis.');
    }
    return output;
  } catch (error: any) {
    console.error('Error in getDailyMarketAnalysis:', error);
    // If it's a quota error, return a graceful message instead of crashing
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        analysis: "Daily analysis is currently unavailable due to API rate limits. Please try again in a few minutes.",
        keyFactors: ["API Rate Limit reached"],
        marketBias: "Neutral"
      };
    }
    throw error;
  }
}
