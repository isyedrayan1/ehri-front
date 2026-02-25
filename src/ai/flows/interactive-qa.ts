'use server';
/**
 * @fileOverview A Genkit flow for handling interactive Q&A about environmental health risks.
 *
 * - interactiveQa - A function that handles user questions about city-specific environmental health data.
 * - InteractiveQaInput - The input type for the interactiveQa function.
 * - InteractiveQaOutput - The return type for the interactiveQa function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CityDataSchema = z.object({
  city: z.string().describe('The name of the city.'),
  ehri: z.number().describe('The Environmental Health Risk Index for the city.'),
  status: z.string().describe('The risk status label (e.g., High Risk).'),
  pollutionStress: z.number(),
  heatStress: z.number(),
  humidityStress: z.number(),
  airQuality: z.object({
    pm25: z.number(),
    status: z.string(),
  }),
  weather: z.object({
    temp: z.number(),
    humidity: z.number(),
    condition: z.string(),
  }),
  populationDensity: z.object({
    value: z.string(),
    context: z.string(),
  }),
  topFactors: z.array(z.object({ name: z.string(), value: z.number() })),
  precautions: z.array(z.object({ text: z.string() })),
  healthImpact: z.object({
    respiratory: z.object({ summary: z.string(), severity: z.number() }),
    cardiovascular: z.object({ summary: z.string(), severity: z.number() }),
    vulnerability: z.object({ demographic: z.string(), riskFactor: z.string() }),
  }),
  explanation: z.string().describe('The general AI-generated explanation of the environmental health situation.'),
  trend: z.array(z.number()).describe('A historical trend of EHRI scores.'),
});

const InteractiveQaInputSchema = z.object({
  question: z.string().describe("The user's natural language question about environmental health risks."),
  cityData: CityDataSchema.describe('Comprehensive grounded data for the selected city.'),
});
export type InteractiveQaInput = z.infer<typeof InteractiveQaInputSchema>;

const InteractiveQaOutputSchema = z.object({
  answer: z.string().describe("The AI's generated answer to the user's question."),
});
export type InteractiveQaOutput = z.infer<typeof InteractiveQaOutputSchema>;

export async function interactiveQa(input: InteractiveQaInput): Promise<InteractiveQaOutput> {
  return interactiveQaFlow(input);
}

const interactiveQaPrompt = ai.definePrompt({
  name: 'interactiveQaPrompt',
  input: { schema: InteractiveQaInputSchema },
  output: { schema: InteractiveQaOutputSchema },
  prompt: `You are an expert Environmental Health Assistant. Your goal is to provide trustworthy, scientifically grounded answers to user questions based EXCLUSIVELY on the provided city data.

DO NOT HALLUCINATE. If the data provided does not contain enough information to answer a specific question (e.g., about a specific street or a non-environmental topic), state clearly that you do not have that specific information.

CONTEXT FOR THE CITY OF {{{cityData.city}}}:
- CURRENT EHRI: {{{cityData.ehri}}} ({{{cityData.status}}})
- AIR QUALITY: PM2.5 is {{{cityData.airQuality.pm25}}} ug/m3 (Status: {{{cityData.airQuality.status}}})
- WEATHER: {{{cityData.weather.temp}}}°C, {{{cityData.weather.humidity}}}% Humidity (Condition: {{{cityData.weather.condition}}})
- DENSITY: {{{cityData.populationDensity.value}}} - {{{cityData.populationDensity.context}}}
- TOP STRESSORS: {{#each cityData.topFactors}}- {{{name}}} (Impact: {{{value}}}) {{/each}}
- HEALTH PRECAUTIONS: {{#each cityData.precautions}}- {{{text}}} {{/each}}
- CLINICAL IMPACTS:
  * Respiratory: {{{cityData.healthImpact.respiratory.summary}}} (Severity: {{{cityData.healthImpact.respiratory.severity}}}%)
  * Cardiovascular: {{{cityData.healthImpact.cardiovascular.summary}}} (Severity: {{{cityData.healthImpact.cardiovascular.severity}}}%)
  * Vulnerability: Most at risk are {{{cityData.healthImpact.vulnerability.demographic}}} due to {{{cityData.healthImpact.vulnerability.riskFactor}}}.
- 7-DAY EHRI TREND: [{{{cityData.trend}}}]

USER QUESTION: "{{{question}}}"

Analyze the question against the context. If they ask about safety (like jogging), refer to the Air Quality, Weather, and Health Precautions. If they ask about vulnerable groups, refer to the Vulnerability section. Be concise, professional, and empathetic.`,
});

const interactiveQaFlow = ai.defineFlow(
  {
    name: 'interactiveQaFlow',
    inputSchema: InteractiveQaInputSchema,
    outputSchema: InteractiveQaOutputSchema,
  },
  async (input) => {
    const { output } = await interactiveQaPrompt(input);
    return output!;
  }
);
