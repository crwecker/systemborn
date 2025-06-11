import { Handler } from '@netlify/functions';
import { prisma } from '../../lib/prisma';
import {
  fetchBooks,
  fetchBookDetails,
  getLitRPGBooks,
  getTrendingLitRPGBooks,
  searchBooks,
  getSimilarBooks,
  getAuthorBooks,
  LITRPG_RELATED_TAGS,
  setPrismaInstance
} from '../../lib/royalroad';

// Set the Prisma instance for the service
setPrismaInstance(prisma);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    console.log('Database URL:', process.env.DATABASE_URL); // Log the database URL (without sensitive parts)
    console.log('Request path:', event.path);
    console.log('Request method:', event.httpMethod);
    console.log('Query parameters:', event.queryStringParameters);

    // Remove the /.netlify/functions/api prefix from the path
    const cleanPath = event.path.replace(/^\/.netlify\/functions\/api\/?/, '');
    const path = cleanPath.split('/').filter(Boolean);
    console.log('Parsed path segments:', path);
    
    // Handle root API call
    if (path.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'API is running' })
      };
    }

    const endpoint = path[0];
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
        const subEndpoint = path[1];
        console.log('Books subEndpoint:', subEndpoint);
        
        try {
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
                query: params.query || undefined,
              });
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(searchResults)
              };

            case 'author':
              const authorName = path[2];
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

            case 'reviews':
              // Get public reviews for a specific book
              if (path[2]) {
                const bookReviews = await prisma.bookReview.findMany({
                  where: { bookId: path[2] },
                  include: { 
                    user: { select: { firstName: true, lastName: true } },
                    book: true 
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 50
                });
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify(bookReviews)
                };
              }
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Book ID is required' })
              };

            default:
              if (subEndpoint) {
                if (path[2] === 'similar') {
                  const similarLimit = params.limit ? parseInt(params.limit) : 5;
                  const similarBooks = await getSimilarBooks(subEndpoint, similarLimit);
                  return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(similarBooks)
                  };
                }
                
                const book = await fetchBookDetails(subEndpoint);
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify(book)
                };
              }
              
              const page = params.page ? parseInt(params.page) : 1;
              const bookList = await fetchBooks(page);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(bookList)
              };
          }
        } catch (error) {
          console.error('Error in books endpoint:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Error processing books request',
              details: error instanceof Error ? error.message : 'Unknown error',
              path: event.path
            })
          };
        }
        break;

      default:
        console.log('No matching endpoint found for:', endpoint);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Endpoint not found', 
            path: event.path, 
            cleanPath,
            segments: path 
          })
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
  } finally {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  }
}; 