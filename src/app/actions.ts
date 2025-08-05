"use server";

import { generateImage } from "@/ai/flows/generate-image";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image";

interface ActionResult {
    imageUrl?: string;
    error?: string;
}

export async function generateImageAction(input: GenerateImageInput): Promise<ActionResult> {
    try {
        if (!input.prompt) {
            return { error: 'Prompt is required.' };
        }

        const output: GenerateImageOutput = await generateImage({ prompt: input.prompt });

        if (!output.imageUrl) {
            return { error: 'Failed to generate image. The AI did not return an image URL.' };
        }

        return { imageUrl: output.imageUrl };

    } catch (error) {
        console.error("Error in generateImageAction:", error);
        // Return a user-friendly error message
        const message = error instanceof Error ? error.message : "An unexpected error occurred during image generation.";
        return { error: message.replace('Flow execution failed: ', '') };
    }
}
