# FrameForge AI — Text-to-Video Generator

A Next.js web app that generates short AI videos from a text prompt using Replicate's `minimax/video-01` model. Includes prompt input, visual styles, aspect-ratio controls, generation status polling, video preview, and a link to open/download the result.

## Requirements

- Node.js 18.17+
- A Replicate account and API token
- A Vercel account for deployment

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set `REPLICATE_API_TOKEN` to your token.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Visit http://localhost:3000.

Get a token at https://replicate.com/account/api-tokens. Never put the token in client-side code or commit it to Git.

## Deploy to Vercel

1. Create a GitHub repository and upload these project files.
2. In Vercel, choose **Add New → Project** and import the repository.
3. In **Project Settings → Environment Variables**, add:
   - Name: `REPLICATE_API_TOKEN`
   - Value: your Replicate API token
   - Environment: Production (and Preview/Development if desired)
4. Deploy. If you add or change environment variables after deployment, redeploy the project.
5. Open the generated `*.vercel.app` URL and test a short prompt.

## Important

- The app's UI is free to deploy, but video inference through Replicate may incur usage charges. Review the model's current pricing before generating.
- The API token is used only in server routes and is never exposed to browser JavaScript.
- Model inputs and output behavior can change. If the model API reports an invalid input, consult its current model page: https://replicate.com/minimax/video-01
- This starter app does not include user accounts, a persistent video gallery, billing controls, or abuse prevention. Add authentication and rate limiting before opening it to the public.
