# Deploying to Netlify

## Prerequisites

- [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed (`npm install netlify-cli -g`) or a Netlify account connected to your Git provider.
- Environment variables for Sanity (and any others) ready.

## Option 1: Deploy via Git (Recommended)

1.  Push your latest changes to your Git repository.
2.  Log in to Netlify and click "Add new site" > "Import an existing project".
3.  Select your Git provider and repository.
4.  Netlify should automatically detect the settings from `netlify.toml`:
    -   **Build command:** `npm run build`
    -   **Publish directory:** `.next`
5.  **Important:** Click "Show advanced" and add your environment variables (e.g., `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`).
6.  Click "Deploy site".

## Option 2: Deploy via CLI

1.  Run `netlify login` to authenticate.
2.  Run `netlify init` in the `next-frontend` directory.
    -   Choose "Create & configure a new site".
    -   Select your team and site name.
    -   The build command and publish directory should be detected from `netlify.toml`.
3.  Run `netlify deploy --prod` to deploy to production.
    -   You may need to link environment variables using `netlify env:set KEY VALUE` or configure them in the Netlify UI.

## Environment Variables

Ensure the following variables are set in Netlify:

-   `NEXT_PUBLIC_SANITY_PROJECT_ID`
-   `NEXT_PUBLIC_SANITY_DATASET`
-   Any other variables from `.env.local` that are needed for production.
