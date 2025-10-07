'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

async function validateWord(word: string): Promise<boolean> {
  return validateWordFlow(word);
}

const ValidateWordInputSchema = z.string().length(5).describe('A 5-letter word to validate.');

const prompt = ai.definePrompt({
  name: 'validateWordPrompt',
  input: { schema: ValidateWordInputSchema },
  model: googleAI.model('gemini-pro'),
  prompt: `You are an English dictionary expert. Your task is to determine if a given 5-letter string is a real, common English word.
  
  Do not consider proper nouns, abbreviations, or slang unless they are extremely common in everyday English.
  
  Word: {{{_input}}}
  
  Is this a valid 5-letter English word? Respond with only the word "true" or "false" and nothing else.`,
});

const validateWordFlow = ai.defineFlow(
  {
    name: 'validateWordFlow',
    inputSchema: ValidateWordInputSchema,
    outputSchema: z.boolean(),
  },
  async (word) => {
    const response = await prompt(word);
    const textResponse = response.text().trim().toLowerCase();
    return textResponse === 'true';
  }
);

export { validateWord };
