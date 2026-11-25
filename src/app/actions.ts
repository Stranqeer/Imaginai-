"use server";

import { generateImage } from "@/ai/flows/generate-image";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image";

interface ActionResult {
    imageUrl?: string;
    error?: string;
}

function friendlyError(error: unknown): string {
    const raw = error instanceof Error ? error.message : String(error);
    const withoutFlowPrefix = raw.replace(/^Flow execution failed:\s*/i, '');
    const lower = withoutFlowPrefix.toLowerCase();

    if (withoutFlowPrefix.startsWith('Image generation needs a Gemini API key.')) {
        return withoutFlowPrefix;
    }

    if (
        lower.includes('api key not valid') ||
        lower.includes('api_key_invalid') ||
        lower.includes('unauthenticated') ||
        lower.includes('permission_denied') ||
        lower.includes('permission denied') ||
        /\b401\b/.test(lower) ||
        /\b403\b/.test(lower)
    ) {
        return 'The Gemini API key was rejected. Put a current Google AI Studio key in GEMINI_API_KEY and restart the dev server.';
    }

    if (
        lower.includes('gemini_api_key') ||
        lower.includes('google_api_key') ||
        lower.includes('api key')
    ) {
        return 'Image generation needs a Gemini API key. Copy .env.example to .env.local, set GEMINI_API_KEY, and restart the dev server.';
    }

    if (lower.includes('safety') || lower.includes('blocked') || lower.includes('prohibited')) {
        return 'That prompt was blocked by the model’s safety filters. Describe the scene a different way.';
    }

    if (
        lower.includes('not found') ||
        lower.includes('not available') ||
        lower.includes('shut down') ||
        lower.includes('deprecated')
    ) {
        return 'The image model is not available. Update the model id in src/ai/flows/generate-image.ts.';
    }

    if (lower.includes('no image') || lower.includes('no valid candidates')) {
        return 'The model did not return an image. Try a more specific prompt.';
    }

    return 'Image generation failed. Check the prompt and your API key, then try again.';
}

export async function generateImageAction(input: GenerateImageInput): Promise<ActionResult> {
    try {
        if (!input.prompt) {
            return { error: 'Prompt is required.' };
        }

        const output: GenerateImageOutput = await generateImage({ prompt: input.prompt });

        if (!output.imageUrl) {
            return { error: 'The model did not return an image. Try a more specific prompt.' };
        }

        return { imageUrl: output.imageUrl };

    } catch (error) {
        const raw = error instanceof Error ? error.message : String(error);
        console.error('Error in generateImageAction:', raw.replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]'));
        return { error: friendlyError(error) };
    }
}
