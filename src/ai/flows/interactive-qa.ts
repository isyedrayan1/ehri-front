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
  pollutionStress: z.number().describe('The pollution stress level.'),
  heatStress: z.number().describe('The heat stress level.'),
  humidityStress: z.number().describe('The humidity stress level.'),
  topFactors: z
    .array(z.object({ name: z.string(), value: z.number() }))
    .describe('A list of top contributing factors to the EHRI, with their names and values.'),
  explanation: z
    .string()
    .describe('A general AI-generated explanation of the environmental health situation.'),
  trend: z.array(z.number()).describe('A historical trend of EHRI scores.'),
});

const InteractiveQaInputSchema = z.object({
  question: z.string().describe("The user's natural language question about environmental health risks in the city."),
  cityData: CityDataSchema.describe('The comprehensive environmental health risk data for the selected city.'),
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
  prompt: `You are an environmental health expert providing clear, concise, and helpful answers based on the provided city data. Focus on directly answering the user's question using the available information.

Here is the environmental health data for the city of {{{cityData.city}}}:
- EHRI Score: {{{cityData.ehri}}}
- Pollution Stress: {{cityData.pollutionStress}}
- Heat Stress: {{cityData.heatStress}}
- Humidity Stress: {{cityData.humidityStress}}
- Top Contributing Factors:
{{#each cityData.topFactors}}- {{{this.name}}} (Value: {{{this.value}}})
{{/each}}
- General Explanation: {{{cityData.explanation}}}

User's Question: "{{{question}}}"

Based on the above data, please provide a clear and concise answer to the user's question. If the question cannot be definitively answered from the provided data, state that you do not have enough specific information, but you can refer to the general explanation or top factors if relevant. Do not make up information that is not present in the data.`,
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
