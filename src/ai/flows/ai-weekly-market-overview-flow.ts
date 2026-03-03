'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a weekly market overview.
 *
 * - getWeeklyMarketOverview - A function that fetches and analyzes weekly economic calendar data to provide a market outlook and success probability.
 * - WeeklyMarketOverviewInput - The input type for the getWeeklyMarketOverview function.
 * - WeeklyMarketOverviewOutput - The return type for the getWeeklyMarketOverview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EconomicCalendarEventSchema = z.object({
  event: z.string().describe('Name of the economic event.'),
  date: z.string().describe('Date of the event in YYYY-MM-DD format.'),
  time: z.string().describe('Time of the event in HH:MM (Bucharest time).'),
  currency: z.string().describe('The currency primarily affected by the event (e.g., USD, EUR).'),
  impact: z.enum(['High', 'Medium', 'Low', 'Holiday']).describe('The anticipated impact level of the event.'),
  actual: z.string().optional().nullable().describe('The actual reported value for the event, if available.'),
  forecast: z.string().optional().nullable().describe('The forecasted value for the event.'),
  previous: z.string().optional().nullable().describe('The previous reported value for the event.'),
});

const WeeklyMarketOverviewInputSchema = z.object({
  economicEvents: z.array(EconomicCalendarEventSchema).describe('An array of aggregated economic calendar events for the week.'),
});

export type WeeklyMarketOverviewInput = z.infer<typeof WeeklyMarketOverviewInputSchema>;

const WeeklyMarketOverviewOutputSchema = z.object({
  weeklyOutlook: z.string().describe('A high-level market outlook for the upcoming week, summarizing key themes and potential volatility.'),
  successProbability: z.number().min(0).max(100).describe('A percentage (0-100) indicating the likelihood of a generally positive or favorable market outcome for the week.'),
  eventsDetail: z.array(z.object({
    id: z.string(),
    sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
    impact_percentage: z.number(),
  })).optional().describe('Sentiment and impact analysis for individual events.'),
});

export type WeeklyMarketOverviewOutput = z.infer<typeof WeeklyMarketOverviewOutputSchema>;

export async function getWeeklyMarketOverview(input: WeeklyMarketOverviewInput): Promise<WeeklyMarketOverviewOutput> {
  try {
    return await weeklyMarketOverviewFlow(input);
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        weeklyOutlook: "Weekly overview is currently unavailable due to API rate limits. Please try again later.",
        successProbability: 50,
        eventsDetail: []
      };
    }
    throw error;
  }
}

const weeklyMarketOverviewPrompt = ai.definePrompt({
  name: 'weeklyMarketOverviewPrompt',
  input: { schema: WeeklyMarketOverviewInputSchema },
  output: { schema: WeeklyMarketOverviewOutputSchema },
  prompt: `You are an expert financial analyst. Your task is to analyze the provided weekly economic calendar events and generate a concise weekly market overview.

The overview should include a high-level market outlook and an associated "success probability" percentage, which represents your confidence in the market having a generally positive or favorable outcome given the events.

Additionally, for each event provided, estimate the "sentiment" (Bullish, Bearish, or Neutral) and an "impact_percentage" (0-100) representing how much this event might influence market volatility.

Here is the list of economic calendar events for the upcoming week, presented as a JSON array:

{{{json economicEvents}}}

Based on this data, provide:
1.  A "weeklyOutlook" describing the key themes, potential volatility, and general sentiment for the week.
2.  A "successProbability" as a number between 0 and 100, indicating the likelihood of a generally positive market outcome.
3.  An array "eventsDetail" with sentiment and impact_percentage for each event.

Ensure your output strictly adheres to the following JSON schema:`,
});

const weeklyMarketOverviewFlow = ai.defineFlow(
  {
    name: 'weeklyMarketOverviewFlow',
    inputSchema: WeeklyMarketOverviewInputSchema,
    outputSchema: WeeklyMarketOverviewOutputSchema,
  },
  async (input) => {
    const { output } = await weeklyMarketOverviewPrompt(input);
    return output!;
  }
);
