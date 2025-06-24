import { Handler } from '@netlify/functions'
import { refreshCache } from '../../lib/cache-manager'
import { clearCache } from '../../lib/redis'

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

const handler: Handler = async (event, context) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  try {
    const path = event.path.replace(/^.*\/cache-refresh\/?/, '') || ''
    
    if (event.httpMethod === 'POST') {
      // Manual cache refresh
      console.log('Manual cache refresh triggered')
      await refreshCache()
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Cache refreshed successfully',
          timestamp: new Date().toISOString()
        })
      }
    } else if (event.httpMethod === 'DELETE') {
      // Clear cache
      console.log('Manual cache clear triggered')
      await clearCache()
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        })
      }
    } else if (event.httpMethod === 'GET') {
      // Get cache status/info
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Cache refresh endpoint',
          available_methods: {
            'POST': 'Refresh cache',
            'DELETE': 'Clear cache'
          },
          timestamp: new Date().toISOString()
        })
      }
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          error: 'Method not allowed',
          allowed_methods: ['GET', 'POST', 'DELETE']
        })
      }
    }
  } catch (error) {
    console.error('Error in cache refresh endpoint:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Cache operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

export { handler } 