import type { Book } from '../types/book';

const API_BASE_URL = 'http://localhost:3005/api';

interface BookListResponse {
  books: Book[];
  totalPages: number;
  currentPage: number;
}

export async function fetchBooks(page: number = 1): Promise<BookListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/books?page=${page}`);
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
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
} 