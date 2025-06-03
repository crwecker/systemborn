import { prisma } from '../lib/prisma';
import { fetchBooks } from '../lib/royalroad';

async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Fetch first 5 pages of books
    for (let page = 1; page <= 5; page++) {
      console.log(`Fetching page ${page}...`);
      const { books } = await fetchBooks(page);
      
      console.log(`Processing ${books.length} books from page ${page}`);
      
      // Process each book
      for (const book of books) {
        console.log(`Processing book: ${book.title} by ${book.author.name}`);
        
        try {
          // Create or update the book
          await prisma.book.upsert({
            where: { id: book.id },
            update: {
              title: book.title,
              authorName: book.author.name || 'Unknown Author',
              description: book.description,
              tags: book.tags,
              coverUrl: book.coverUrl,
              sourceUrl: book.url,
              source: 'ROYAL_ROAD',
            },
            create: {
              id: book.id,
              title: book.title,
              authorName: book.author.name || 'Unknown Author',
              description: book.description,
              tags: book.tags,
              coverUrl: book.coverUrl,
              sourceUrl: book.url,
              source: 'ROYAL_ROAD',
            },
          });

          // Create new stats entry for today
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day for consistent timestamps

          await prisma.bookStats.create({
            data: {
              bookId: book.id,
              createdAt: today,
              rating: book.rating || 0,
              followers: book.stats?.followers || 0,
              views: book.stats?.views?.total || 0,
              pages: book.stats?.pages || 0,
            },
          });

          console.log(`Successfully processed book: ${book.title}`);
        } catch (error) {
          if (error.code === 'P2002') {
            // Unique constraint violation - stats already exist for today
            console.log(`Stats already exist for ${book.title} today, skipping...`);
          } else {
            console.error(`Error processing book ${book.title}:`, error);
          }
        }
      }
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Database population completed!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateDatabase(); 