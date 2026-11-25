import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  // apiKey: false defers the key check until a generate call. Without this,
  // registering models throws FAILED_PRECONDITION when GEMINI_API_KEY is unset.
  plugins: [googleAI({apiKey: false})],
  model: 'googleai/gemini-2.0-flash',
});
