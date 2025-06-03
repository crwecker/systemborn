import express from 'express';
import cors from 'cors';
import { fetchBooks, fetchBookDetails } from './services/royalroad.server';

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

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