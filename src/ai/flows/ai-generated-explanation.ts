'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate an AI explanation
 * for the environmental health risk of a selected city.
 *
 * - generateAiExplanation - A function that handles the AI explanation generation process.
 * - AiExplanationInput - The input type for the generateAiExplanation function.
 * - AiExplanationOutput - The return type for the generateAiExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiExplanationInputSchema = z.object({
  city: z.string().describe('The name of the city.'),
  ehri: z.number().describe('The Environmental Health Risk Index (EHRI) for the city.'),
  pollutionStress: z
    .number()
    .describe('The pollution stress level (0-1) for the city.'),
  heatStress: z.number().describe('The heat stress level (0-1) for the city.'),
  humidityStress: z
    .number()
    .describe('The humidity stress level (0-1) for the city.'),
  topFactors: z
    .array(
      z.object({
        name: z.string().describe('The name of the factor (e.g., PM2.5).'),
        value: z.number().describe('The importance value of the factor (0-1).'),
      })
    )
    .describe('A list of top contributing factors and their importance.'),
});
export type AiExplanationInput = z.infer<typeof AiExplanationInputSchema>;

const AiExplanationOutputSchema = z
  .string()
  .describe('A comprehensive AI-generated explanation of the environmental health risk.');
export type AiExplanationOutput = z.infer<typeof AiExplanationOutputSchema>;

export async function generateAiExplanation(
  input: AiExplanationInput
): Promise<AiExplanationOutput> {
  return aiExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiExplanationPrompt',
  input: {schema: AiExplanationInputSchema},
  output: {schema: AiExplanationOutputSchema},
  prompt: `You are an expert environmental health analyst.

Generate a concise and informative explanation of the environmental health risk for the city of {{{city}}}.
Highlight the key contributing factors and their implications for human health. Use the following data:

City: {{{city}}}
EHRI: {{{ehri}}}
Pollution Stress: {{{pollutionStress}}}
Heat Stress: {{{heatStress}}}
Humidity Stress: {{{humidityStress}}}
Top Contributing Factors:
{{#each topFactors}}
- {{{name}}}: {{{value}}}
{{/each}}

Provide a summary that can be easily understood by a non-technical user, focusing on key risks and potential impacts. Keep it under 200 words.`,
});

const aiExplanationFlow = ai.defineFlow(
  {
    name: 'aiExplanationFlow',
    inputSchema: AiExplanationInputSchema,
    outputSchema: AiExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
