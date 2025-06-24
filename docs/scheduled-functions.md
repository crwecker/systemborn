# Scheduled Functions Setup

This document explains how the nightly database population is set up using Netlify Scheduled Functions.

## Overview

The `scheduled-populate.ts` function runs automatically every night at 2 AM UTC to keep the database updated with the latest book data from Royal Road.

## Architecture

The system uses a shared `DatabasePopulator` class to avoid code duplication:

- `lib/database-populator.ts` - Shared core logic
- `netlify/functions/scheduled-populate.ts` - Netlify scheduled function
- `scripts/test-scheduled-populate.ts` - Local testing script
- `scripts/populate-db.ts` - Manual script version

## Files

- `lib/database-populator.ts` - Shared DatabasePopulator class (core logic)
- `netlify/functions/scheduled-populate.ts` - The scheduled function
- `scripts/test-scheduled-populate.ts` - Local testing script (recommended for testing)
- `netlify.toml` - Configuration for the scheduled function
- `scripts/populate-db.ts` - Manual script version (for testing)

## Configuration

The scheduled function is configured in `netlify.toml`:

```toml
[functions."scheduled-populate"]
  schedule = "0 2 * * *"  # Run at 2 AM UTC daily
```

### Cron Schedule Format

The schedule uses standard cron format: `minute hour day month day-of-week`

- `0 2 * * *` = Every day at 2:00 AM UTC
- `0 */6 * * *` = Every 6 hours
- `0 2 * * 1` = Every Monday at 2:00 AM UTC

## Function Features

The scheduled function includes:

1. **Security Check**: Only allows execution from AWS Events (scheduled triggers)
2. **Existing Book Detection**: Fetches complete stats for books already in the database
3. **Follower Filter**: Only processes books with 50+ followers (configurable)
4. **Error Handling**: Graceful error handling with detailed logging
5. **Statistics**: Returns processing counts and timestamps
6. **Configurable Options**: Customizable page limits and follower thresholds

## Local Testing

### Recommended: Use the Test Script

The easiest way to test locally is using the dedicated test script:

```bash
npm run test-scheduled
```

This script:
- Runs the same logic as the scheduled function
- Processes only 2 pages (instead of 5) for faster testing
- Doesn't require Netlify CLI or function infrastructure
- Avoids Prisma engine compatibility issues
- Uses the shared DatabasePopulator class

### Alternative: Netlify CLI (Advanced)

If you want to test the actual function:

```bash
# Install Netlify CLI globally
npm i -g netlify-cli

# Test the scheduled function locally
netlify functions:invoke scheduled-populate
```

**Note**: The Netlify CLI approach may have Prisma engine compatibility issues on macOS. The test script is recommended for local testing.

## Shared DatabasePopulator Class

The `DatabasePopulator` class provides:

```typescript
interface PopulationOptions {
  maxPages?: number;      // Default: 5
  minFollowers?: number;  // Default: 50
  prisma?: PrismaClient;  // Optional custom Prisma instance
}

interface PopulationResult {
  processed: number;  // Successfully processed books
  skipped: number;    // Books skipped due to low followers
  errors: number;     // Books that encountered errors
  timestamp: string;  // ISO timestamp of completion
}
```

### Usage Examples

```typescript
// Basic usage
const populator = new DatabasePopulator();
const result = await populator.populateDatabase();

// Custom configuration
const result = await populator.populateDatabase({
  maxPages: 3,
  minFollowers: 100,
});

// With custom Prisma instance
const customPrisma = new PrismaClient({ /* custom config */ });
const populator = new DatabasePopulator(customPrisma);
```

## Monitoring

The function returns detailed response data:

```json
{
  "message": "Database population completed successfully",
  "processed": 45,
  "skipped": 12,
  "errors": 2,
  "timestamp": "2024-01-15T02:00:00.000Z"
}
```

## Logs

Function logs are available in the Netlify dashboard under:
- Site Settings → Functions → scheduled-populate → Logs

## Troubleshooting

### Common Issues

1. **Prisma Engine Compatibility**: 
   - **Problem**: "Found incompatible prebuilt function binary" error
   - **Solution**: Use `npm run test-scheduled` instead of Netlify CLI for local testing
   - **Why**: Netlify functions need Linux/Amd64 binaries, but macOS uses Darwin/Arm64

2. **Function Timeout**: The function may timeout if processing too many books. Consider reducing the number of pages processed.

3. **Database Connection**: Ensure your database connection string is properly configured in Netlify environment variables.

4. **Rate Limiting**: The function includes delays between requests to avoid overwhelming Royal Road's servers.

### Environment Variables

Make sure these are set in your Netlify environment:
- `DATABASE_URL` - Your Prisma database connection string

## Alternative Solutions

If Netlify Scheduled Functions don't work for your needs, consider:

1. **GitHub Actions**: Create a workflow that runs on a schedule
2. **External Cron Service**: Use services like cron-job.org or EasyCron
3. **Server Cron**: Set up a cron job on your own server

## GitHub Actions Alternative

If you prefer GitHub Actions, create `.github/workflows/scheduled-populate.yml`:

```yaml
name: Scheduled Database Population

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  populate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run populate-db
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
``` 