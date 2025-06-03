import type { Book } from '../types/book';
import { JSDOM } from 'jsdom';

const ROYALROAD_BASE_URL = 'https://www.royalroad.com';

export async function getPopularBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    const html = await response.text();
    
    // Create a DOM using jsdom
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Find all fiction entries
    const fictionElements = doc.querySelectorAll('.fiction-list-item');
    
    return Array.from(fictionElements).map(element => {
      const titleElement = element.querySelector('.fiction-title');
      const authorElement = element.querySelector('.author');
      const tagsElements = element.querySelectorAll('.tags a');
      const imageElement = element.querySelector('img');
      const descriptionElement = element.querySelector('.description');
      const statsElements = element.querySelectorAll('.stats .col-sm-6');
      
      const stats: any = {};
      statsElements.forEach(stat => {
        const label = stat.querySelector('label')?.textContent?.trim().toLowerCase();
        const value = stat.textContent?.replace(label || '', '').trim();
        if (label && value) {
          stats[label] = value;
        }
      });

      return {
        title: titleElement?.textContent?.trim() || '',
        author: {
          name: authorElement?.textContent?.trim() || ''
        },
        tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
        image: imageElement?.getAttribute('src') || '',
        description: descriptionElement?.textContent?.trim() || '',
        stats: {
          followers: parseInt(stats['followers']?.replace(/,/g, '') || '0', 10),
          pages: parseInt(stats['pages']?.replace(/,/g, '') || '0', 10),
          views: {
            total: parseInt(stats['total views']?.replace(/,/g, '') || '0', 10),
            average: 0
          },
          score: {
            total: parseFloat(stats['rating']?.split(' ')[0] || '0'),
            average: parseFloat(stats['rating']?.split(' ')[0] || '0')
          }
        }
      };
    });
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
}

interface BookListResponse {
  books: Book[];
  totalPages: number;
  currentPage: number;
}

export async function fetchBooks(page: number = 1): Promise<{ books: Book[]; totalPages: number; currentPage: number }> {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated?page=${page}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books from Royal Road');
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const fictionElements = document.querySelectorAll('.fiction-list-item');
    const books: Book[] = Array.from(fictionElements).map((element): Book => {
      const titleElement = element.querySelector('.fiction-title a');
      const authorElement = element.querySelector('.author');
      const tagsElements = element.querySelectorAll('.tags a');
      const imageElement = element.querySelector('img');
      const descriptionElement = element.querySelector('.description');
      const ratingElement = element.querySelector('.rating');

      const id = titleElement?.getAttribute('href')?.split('/').pop() || '';
      const rating = parseFloat(ratingElement?.textContent?.trim() || '0');

      return {
        id,
        title: titleElement?.textContent?.trim() || '',
        author: authorElement?.textContent?.trim() || '',
        description: descriptionElement?.textContent?.trim() || '',
        tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
        rating: isNaN(rating) ? 0 : rating,
        coverUrl: imageElement?.getAttribute('src') || '',
        url: `${ROYALROAD_BASE_URL}${titleElement?.getAttribute('href')}`,
      };
    });

    // Get pagination info
    const paginationElement = document.querySelector('.pagination');
    const lastPageElement = paginationElement?.querySelector('li:last-child a');
    const totalPages = lastPageElement 
      ? parseInt(lastPageElement.getAttribute('data-page') || '1', 10)
      : 1;

    return {
      books,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

export async function fetchBookDetails(bookId: string): Promise<Book> {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fiction/${bookId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book details from Royal Road');
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const titleElement = document.querySelector('.fic-title h1');
    const authorElement = document.querySelector('.fic-header span[property="name"]');
    const descriptionElement = document.querySelector('.description');
    const tagsElements = document.querySelectorAll('.tags a');
    const ratingElement = document.querySelector('.rating-content');
    const coverElement = document.querySelector('.cover-art-container img');

    const rating = parseFloat(ratingElement?.textContent?.trim() || '0');

    return {
      id: bookId,
      title: titleElement?.textContent?.trim() || '',
      author: authorElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
      rating: isNaN(rating) ? 0 : rating,
      coverUrl: coverElement?.getAttribute('src') || '',
      url: `${ROYALROAD_BASE_URL}/fiction/${bookId}`,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
} 