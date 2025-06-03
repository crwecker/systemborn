import { Handler } from '@netlify/functions';
import { fetchBooks, fetchBookDetails } from '../../server/services/royalroad.server';

export const handler: Handler = async (event) => {
  try {
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

    // Get book ID from path parameter
    const path = event.path.split('/').filter(Boolean);
    const bookId = path[path.length - 1];

    // If bookId is present, fetch specific book details
    if (bookId && bookId !== 'books') {
      const book = await fetchBookDetails(bookId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(book),
      };
    }

    // Otherwise, fetch book list
    const page = event.queryStringParameters?.page ? parseInt(event.queryStringParameters.page) : 1;
    const books = await fetchBooks(page);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(books),
    };
  } catch (error) {
    console.error('Error in books function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch books' }),
    };
  }
}; 