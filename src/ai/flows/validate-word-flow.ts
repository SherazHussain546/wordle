'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const ValidateWordInputSchema = z.string().length(5).describe('A 5-letter word to validate.');
const ValidateWordOutputSchema = z.boolean().describe('Whether the word is a valid English word.');

export async function validateWord(word: string): Promise<boolean> {
  return validateWordFlow(word);
}

const prompt = ai.definePrompt({
  name: 'validateWordPrompt',
  model: googleAI.model('gemini-2.5-flash-preview'),
  input: { schema: ValidateWordInputSchema },
  output: { schema: ValidateWordOutputSchema },
  prompt: `You are an English dictionary expert. Your task is to determine if a given 5-letter string is a real, common English word.
  
  Do not consider proper nouns, abbreviations, or slang unless they are extremely common in everyday English.
  
  Word: {{{_input}}}
  
  Is this a valid 5-letter English word? Respond with only true or false.`,
});

const validateWordFlow = ai.defineFlow(
  {
    name: 'validateWordFlow',
    inputSchema: ValidateWordInputSchema,
    outputSchema: ValidateWordOutputSchema,
  },
  async (word) => {
    const { output } = await prompt(word);
    return output ?? false;
  }
);
