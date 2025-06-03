import type { Book } from '../types/book';

// Use Netlify Functions in production, local server in development
const API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/api'
  : 'http://localhost:3000/.netlify/functions/api';

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

export async function fetchTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

export async function fetchTrendingBooks(limit: number = 10): Promise<Book[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/trending?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending books:', error);
    throw error;
  }
}

interface SearchParams {
  tags?: string[];
  minRating?: number;
  minPages?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

export async function searchBooks(params: SearchParams): Promise<Book[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.tags?.length) {
      params.tags.forEach(tag => searchParams.append('tags', tag));
    }
    if (params.minRating) {
      searchParams.append('minRating', params.minRating.toString());
    }
    if (params.minPages) {
      searchParams.append('minPages', params.minPages.toString());
    }
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const response = await fetch(`${API_BASE_URL}/books/search?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to search books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

export async function fetchSimilarBooks(bookId: string, limit: number = 5): Promise<Book[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/similar?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch similar books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar books:', error);
    throw error;
  }
}

export async function fetchAuthorBooks(authorName: string): Promise<Book[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/author/${encodeURIComponent(authorName)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch author books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching author books:', error);
    throw error;
  }
} 