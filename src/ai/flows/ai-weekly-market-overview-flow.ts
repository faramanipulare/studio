'use server';

import { ai, geminiModel } from '../genkit';
import { z } from 'genkit';

const EconomicCalendarEventSchema = z.object({
  id: z.string().optional(),
  event: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  currency: z.string().optional(),
  impact: z.string().optional(),
  actual: z.string().optional().nullable(),
  forecast: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
});

const WeeklyMarketOverviewInputSchema = z.object({
  economicEvents: z.array(EconomicCalendarEventSchema).optional(),
});

export type WeeklyMarketOverviewInput = z.infer<typeof WeeklyMarketOverviewInputSchema>;

const WeeklyMarketOverviewOutputSchema = z.object({
  weeklyOutlook: z.string(),
  successProbability: z.number(),
});

export type WeeklyMarketOverviewOutput = z.infer<typeof WeeklyMarketOverviewOutputSchema>;

const weeklyMarketOverviewPrompt = ai.definePrompt({
  name: 'weeklyMarketOverviewPrompt',
  model: geminiModel,
  input: { schema: WeeklyMarketOverviewInputSchema },
  output: { schema: WeeklyMarketOverviewOutputSchema },
  prompt: `You are an expert financial analyst. Your task is to analyze the provided weekly economic calendar events and generate a concise weekly market overview.

The overview should include a high-level market outlook and an associated "success probability" percentage, which represents your confidence in the market having a generally positive or favorable outcome given the events.

Here is the list of economic calendar events for the upcoming week, presented as a JSON array:

{{json economicEvents}}

Based on this data, provide:
1.  A "weeklyOutlook" describing the key themes, potential volatility, and general sentiment for the week.
2.  A "successProbability" as a number between 0 and 100, indicating the likelihood of a generally positive market outcome.

Ensure your output strictly adheres to the following JSON schema:`,
});

export async function getWeeklyMarketOverview(input: WeeklyMarketOverviewInput): Promise<WeeklyMarketOverviewOutput> {
  try {
    const { output } = await weeklyMarketOverviewPrompt(input);
    if (!output) {
      throw new Error('Failed to generate weekly market overview.');
    }
    return output;
  } catch (error: any) {
    console.error('Error in getWeeklyMarketOverview:', error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        weeklyOutlook: "Weekly analysis is currently unavailable due to API rate limits. Please try again later.",
        successProbability: 50
      };
    }
    throw error;
  }
}
