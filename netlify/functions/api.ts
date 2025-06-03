import { Handler } from '@netlify/functions';
import {
  fetchBooks,
  fetchBookDetails,
  getLitRPGBooks,
  getTrendingLitRPGBooks,
  searchBooks,
  getSimilarBooks,
  getAuthorBooks,
  LITRPG_RELATED_TAGS
} from '../../server/services/royalroad.server';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    console.log('Request path:', event.path);
    console.log('Request method:', event.httpMethod);
    console.log('Query parameters:', event.queryStringParameters);

    const path = event.path.split('/').filter(Boolean);
    console.log('Parsed path segments:', path);
    
    // Handle root API call
    if (path.length === 0 || (path.length === 1 && path[0] === 'api')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'API is running' })
      };
    }

    const endpoint = path[1]; // First segment after 'api'
    console.log('Endpoint:', endpoint);
    
    const params = event.queryStringParameters || {};

    switch (endpoint) {
      case 'tags':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(LITRPG_RELATED_TAGS)
        };

      case 'books':
        // Handle different book-related endpoints
        const subEndpoint = path[2];
        console.log('Books subEndpoint:', subEndpoint);
        
        switch (subEndpoint) {
          case 'litrpg':
            const books = await getLitRPGBooks();
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(books)
            };

          case 'trending':
            const limit = params.limit ? parseInt(params.limit) : 10;
            const trendingBooks = await getTrendingLitRPGBooks(limit);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(trendingBooks)
            };

          case 'search':
            const searchResults = await searchBooks({
              tags: params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : [],
              minRating: params.minRating ? parseFloat(params.minRating) : undefined,
              minPages: params.minPages ? parseInt(params.minPages) : undefined,
              sortBy: params.sortBy as any,
              limit: params.limit ? parseInt(params.limit) : undefined,
              offset: params.offset ? parseInt(params.offset) : undefined,
            });
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(searchResults)
            };

          case 'author':
            const authorName = path[3];
            if (!authorName) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Author name is required' })
              };
            }
            const authorBooks = await getAuthorBooks(authorName);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(authorBooks)
            };

          default:
            // Handle single book or book list
            if (subEndpoint) {
              // Check if it's a request for similar books
              if (path[3] === 'similar') {
                const similarLimit = params.limit ? parseInt(params.limit) : 5;
                const similarBooks = await getSimilarBooks(subEndpoint, similarLimit);
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify(similarBooks)
                };
              }
              
              // Single book details
              const book = await fetchBookDetails(subEndpoint);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(book)
              };
            }
            
            // Book list
            const page = params.page ? parseInt(params.page) : 1;
            const bookList = await fetchBooks(page);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(bookList)
            };
        }
        break;

      default:
        console.log('No matching endpoint found for:', endpoint);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found', path: event.path, segments: path })
        };
    }
  } catch (error) {
    console.error('Error in API function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        path: event.path
      })
    };
  }
}; 