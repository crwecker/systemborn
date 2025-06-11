import type { Book } from '../types/book';

// Use Netlify Functions in production, local server in development
export const API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/api'
  : 'http://localhost:3000/.netlify/functions/api';

export const USER_API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/user-api'
  : 'http://localhost:3000/.netlify/functions/user-api';

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

export async function fetchAvailableTags(): Promise<string[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
}

// Book Tiers API functions
import type { BookTier, BookReview, TierLevel } from '../types/book';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function fetchUserBookTiers(userId: string): Promise<BookTier[]> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/users/${userId}/tiers`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user book tiers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user book tiers:', error);
    throw error;
  }
}

export async function assignBookToTier(bookId: string, tier: TierLevel): Promise<BookTier> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, tier }),
    });
    if (!response.ok) {
      throw new Error('Failed to assign book to tier');
    }
    return await response.json();
  } catch (error) {
    console.error('Error assigning book to tier:', error);
    throw error;
  }
}

export async function updateBookTier(tierId: string, tier: TierLevel): Promise<BookTier> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers/${tierId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tier }),
    });
    if (!response.ok) {
      throw new Error('Failed to update book tier');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating book tier:', error);
    throw error;
  }
}

export async function removeBookFromTiers(tierId: string): Promise<void> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers/${tierId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to remove book from tiers');
    }
  } catch (error) {
    console.error('Error removing book from tiers:', error);
    throw error;
  }
}

// Book Reviews API functions
export async function fetchUserBookReviews(userId: string): Promise<BookReview[]> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/users/${userId}/reviews`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user book reviews');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user book reviews:', error);
    throw error;
  }
}

export async function fetchBookReviews(bookId: string): Promise<BookReview[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch book reviews');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    throw error;
  }
}

export async function createBookReview(bookId: string, review: string): Promise<BookReview> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, review }),
    });
    if (!response.ok) {
      throw new Error('Failed to create book review');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating book review:', error);
    throw error;
  }
}

export async function updateBookReview(reviewId: string, review: string): Promise<BookReview> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ review }),
    });
    if (!response.ok) {
      throw new Error('Failed to update book review');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating book review:', error);
    throw error;
  }
}

export async function deleteBookReview(reviewId: string): Promise<void> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete book review');
    }
  } catch (error) {
    console.error('Error deleting book review:', error);
    throw error;
  }
} 