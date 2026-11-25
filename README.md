# ImaginAI

Text-to-image studio exported from Firebase Studio. A prompt is sent to a Gemini image model through a Genkit flow, and the picture is shown on the page.

## Run locally

```bash
npm install
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local. Create one at https://aistudio.google.com/apikey
npm run dev
```

Open [http://127.0.0.1:9002](http://127.0.0.1:9002).

Without a key, the page still loads. Generate Image shows a message that names `GEMINI_API_KEY` instead of a crash. An invalid key is reported the same way. Restart the dev server after changing `.env.local`.

The app reads the first non-empty value among `GEMINI_API_KEY`, `GOOGLE_API_KEY`, and `GOOGLE_GENAI_API_KEY`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Image model

`src/ai/flows/generate-image.ts` calls `gemini-nano-banana-2.1`. That id is listed as a current Gemini image model at [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation). The call still sends one text prompt and asks for text and image modalities.

`gemini-2.0-flash-preview-image-generation`, the model this project originally used, was shut down on 14 November 2025.

Do not commit `.env` or `.env.local`.
