import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GoogleAuth } from 'google-auth-library';

export const ai = genkit({
  plugins: [
    googleAI({
      auth: new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      }),
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
