// This file holds the Genkit flow for generating images from a prompt.
// It exports the generateImage function, the GenerateImageInput type, and the GenerateImageOutput type.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate the image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

/** Confirmed on https://ai.google.dev/gemini-api/docs/image-generation */
const IMAGE_MODEL = 'gemini-nano-banana-2.1';

function readGeminiApiKey(): string | undefined {
  const value =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'your_gemini_api_key') {
    return undefined;
  }
  return trimmed;
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    const apiKey = readGeminiApiKey();
    if (!apiKey) {
      throw new Error(
        'Image generation needs a Gemini API key. Copy .env.example to .env.local, set GEMINI_API_KEY, and restart the dev server.'
      );
    }

    const {media} = await ai.generate({
      model: `googleai/${IMAGE_MODEL}`,
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        apiKey,
      },
    });

    if (!media?.url) {
      throw new Error('No image was generated.');
    }

    return {imageUrl: media.url};
  }
);
