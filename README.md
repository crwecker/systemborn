# System Born - LitRPG Academy

A React Router v7 application for discovering LitRPG, GameLit, and Progression Fantasy stories.

## Features

- Browse popular LitRPG stories from Royal Road
- Modern, responsive design with Tailwind CSS
- Server-side rendering for optimal performance
- Book discovery with ratings, tags, and stats

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:5173`.

## Deployment

### Netlify Deployment

This project is configured for deployment on Netlify using React Router v7:

```bash
# Build for Netlify
npm run build:netlify
```

The `netlify.toml` file configures:
- **Build command**: `npm run build:netlify`
- **Publish directory**: `build/client` 
- **Functions directory**: `netlify/functions`
- **Dev server**: `npm run dev` on port 5173

### Netlify Setup

1. Connect your repository to Netlify
2. Netlify will automatically detect the `netlify.toml` configuration
3. Ensure Node.js version is set to 20+ in Netlify build settings
4. Deploy will build both the React Router app and the serverless function

## Technology Stack

- **Framework**: React Router v7
- **Runtime**: Node.js 20+
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Netlify Functions
- **API**: Royal Road scraping with jsdom



