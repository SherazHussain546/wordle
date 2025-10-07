'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

export async function validateWord(word: string): Promise<boolean> {
  return validateWordFlow(word);
}

const prompt = ai.definePrompt(
  {
    name: 'validateWordPrompt',
    input: { schema: z.string().length(5) },
    model: googleAI.model('gemini-pro'),
    prompt: `You are a word validation expert. Given the following 5-letter word, determine if it is a valid English word.
    
    Word: {{{input}}}
    
    Is this a valid English word? Respond with only "true" or "false".`,
  }
);

const validateWordFlow = ai.defineFlow(
  {
    name: 'validateWordFlow',
    inputSchema: z.string().length(5),
    outputSchema: z.boolean(),
  },
  async (word) => {
    const response = await prompt(word);
    const textResponse = response.text().trim().toLowerCase();
    return textResponse === 'true';
  }
);
