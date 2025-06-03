import type { Book } from '../types/book';

// Use Netlify Functions in production, local server in development
const API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/books'
  : 'http://localhost:3005/api/books';

interface BookListResponse {
  books: Book[];
  totalPages: number;
  currentPage: number;
}

export async function fetchBooks(page: number = 1): Promise<BookListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}?page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

export async function fetchBookDetails(bookId: string): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
} 