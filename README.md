# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# LitRPG Academy

A curated platform for discovering the best LitRPG, GameLit, and progression fantasy books.

## Features

- **Book Discovery**: Browse and search through a curated collection of LitRPG and GameLit books
- **Smart Filtering**: Filter by tags, ratings, source, and more
- **User Reviews**: Read and write reviews for books
- **Tier Lists**: Create personal tier lists of your favorite books
- **Real-time Data**: Book stats are updated regularly from Royal Road
- **Amazon Integration**: Featured book recommendations with affiliate links

## Book Sorting and Display Behavior

### Amazon Books Priority
**IMPORTANT**: Amazon books are always displayed first in all book listings, regardless of the selected sort criteria. This is intentional because:

1. Amazon books are curated recommendations and don't have Royal Road stats (followers, views, etc.)
2. They serve as featured/sponsored content
3. They provide monetization through affiliate links

**Do not change this behavior** - Amazon books should always appear before Royal Road books in search results, even when sorting by followers, rating, etc.

### Sort Order Logic
1. **Amazon books** - Always first (sorted by manual curation order)
2. **Royal Road books** - Sorted by selected criteria (followers, rating, views, etc.)

This ensures users see curated recommendations first, followed by community-driven content sorted by their preferred metrics.

## Caching System

### Redis Cache with Upstash
The application uses **Upstash Redis** for high-performance caching to reduce database load and improve response times.

#### Cached Data
- **Royal Road Books** - All book data with latest stats (refreshed hourly)
- **Amazon Books** - Featured affiliate book recommendations (refreshed hourly)  
- **Popular Tags** - Most frequently used tags (refreshed daily)
- **All Tags** - Complete list of unique tags (refreshed daily)

#### Cache Refresh Schedule
- **Automatic**: Every hour via scheduled Netlify function (`scheduled-cache-refresh.ts`)
- **Manual**: POST to `/.netlify/functions/cache-refresh` 
- **Clear Cache**: DELETE to `/.netlify/functions/cache-refresh`

#### Cache TTL (Time To Live)
- Books: 1 hour (3600 seconds)
- Tags: 24 hours (86400 seconds)

#### Environment Variables
```
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_actual_token_here
```

**Important**: Use the **REST API URL** (starts with `https://`) from your Upstash console, NOT the Redis CLI connection string. The REST API section will have the format: `https://your-database.upstash.io`

#### Benefits
- **10x faster queries** - Data served from memory instead of database
- **Reduced database load** - Fewer direct database queries
- **Better user experience** - Faster page loads and search results
- **Automatic fallback** - Falls back to database if cache is unavailable
