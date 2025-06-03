import express from 'express';
import cors from 'cors';
import { fetchBooks, fetchBookDetails, getLitRPGBooks, getTrendingLitRPGBooks, searchBooks, getSimilarBooks, getAuthorBooks, LITRPG_RELATED_TAGS } from './services/royalroad.server';

const app = express();
const port = process.env.PORT || 3005;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Get all LitRPG related tags
app.get('/api/books/tags', (req, res) => {
  res.json(LITRPG_RELATED_TAGS);
});

// Get all LitRPG books
app.get('/api/books/litrpg', async (req, res) => {
  try {
    const books = await getLitRPGBooks();
    res.json(books);
  } catch (error) {
    console.error('Error fetching LitRPG books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get trending LitRPG books
app.get('/api/books/trending', async (req, res) => {
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
app.get('/api/books/search', async (req, res) => {
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

// Get books by author
app.get('/api/books/author/:authorName', async (req, res) => {
  try {
    const { authorName } = req.params;
    const books = await getAuthorBooks(authorName);
    res.json(books);
  } catch (error) {
    console.error('Error fetching author books:', error);
    res.status(500).json({ error: 'Failed to fetch author books' });
  }
});

// Get book list
app.get('/api/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const books = await fetchBooks(page);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get similar books for a specific book
app.get('/api/books/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    const books = await getSimilarBooks(id, limit);
    res.json(books);
  } catch (error) {
    console.error('Error fetching similar books:', error);
    res.status(500).json({ error: 'Failed to fetch similar books' });
  }
});

// Get specific book details
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await fetchBookDetails(req.params.id);
    res.json(book);
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 