import { Router } from 'express';
import {
  getLitRPGBooks,
  getTrendingLitRPGBooks,
  searchBooks,
  getSimilarBooks,
  getAuthorBooks,
  LITRPG_RELATED_TAGS,
} from '../services/royalroad.server';

const router = Router();

// Get all LitRPG related tags
router.get('/tags', (req, res) => {
  res.json(LITRPG_RELATED_TAGS);
});

// Get all LitRPG books
router.get('/litrpg', async (req, res) => {
  try {
    const books = await getLitRPGBooks();
    res.json(books);
  } catch (error) {
    console.error('Error fetching LitRPG books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get trending LitRPG books
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const books = await getTrendingLitRPGBooks(limit);
    res.json(books);
  } catch (error) {
    console.error('Error fetching trending books:', error);
    res.status(500).json({ error: 'Failed to fetch trending books' });
  }
});

// Search books with filters
router.get('/search', async (req, res) => {
  try {
    const {
      tags,
      minRating,
      minPages,
      sortBy,
      limit,
      offset,
    } = req.query;

    const books = await searchBooks({
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : [],
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      minPages: minPages ? parseInt(minPages as string) : undefined,
      sortBy: sortBy as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// Get similar books
router.get('/:bookId/similar', async (req, res) => {
  try {
    const { bookId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    const books = await getSimilarBooks(bookId, limit);
    res.json(books);
  } catch (error) {
    console.error('Error fetching similar books:', error);
    res.status(500).json({ error: 'Failed to fetch similar books' });
  }
});

// Get books by author
router.get('/author/:authorName', async (req, res) => {
  try {
    const { authorName } = req.params;
    const books = await getAuthorBooks(authorName);
    res.json(books);
  } catch (error) {
    console.error('Error fetching author books:', error);
    res.status(500).json({ error: 'Failed to fetch author books' });
  }
});

export default router; 