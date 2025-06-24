import { Handler, schedule } from '@netlify/functions'
import { prisma } from '../../lib/prisma'
import { refreshCache } from '../../lib/cache-manager'

const handler: Handler = async (event, context) => {
  console.log('Starting scheduled cache refresh...')
  
  try {
    // Refresh all cached data
    await refreshCache()
    
    console.log('Scheduled cache refresh completed successfully')
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cache refreshed successfully',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error in scheduled cache refresh:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to refresh cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Schedule the function to run every hour
// Cron format: minute hour day month dayOfWeek
const scheduledHandler = schedule('0 * * * *', handler)

export { scheduledHandler as handler } 