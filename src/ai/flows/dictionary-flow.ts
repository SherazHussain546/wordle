'use server';
/**
 * @fileOverview A dictionary flow that provides definitions for words.
 *
 * - getDefinition - A function that fetches the definition of a word.
 * - WordDefinitionInput - The input type for the getDefinition function.
 * - WordDefinitionOutput - The return type for the getDefinition function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WordDefinitionInputSchema = z.object({
  word: z.string().describe('The word to be defined.'),
});
export type WordDefinitionInput = z.infer<typeof WordDefinitionInputSchema>;

const WordDefinitionOutputSchema = z.object({
  definition: z.string().describe('The definition of the word.'),
});
export type WordDefinitionOutput = z.infer<typeof WordDefinitionOutputSchema>;

export async function getDefinition(
  input: WordDefinitionInput
): Promise<WordDefinitionOutput> {
  return getDefinitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getDefinitionPrompt',
  input: { schema: WordDefinitionInputSchema },
  output: { schema: WordDefinitionOutputSchema },
  prompt: `Provide a concise, one-sentence dictionary definition for the word: {{{word}}}. Do not add any conversational filler.`,
});

const getDefinitionFlow = ai.defineFlow(
  {
    name: 'getDefinitionFlow',
    inputSchema: WordDefinitionInputSchema,
    outputSchema: WordDefinitionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
