import { prisma } from '../server/lib/prisma';
import {
  getLitRPGBooks,
  getTrendingLitRPGBooks,
  searchBooks,
  getSimilarBooks,
  getAuthorBooks,
  LITRPG_RELATED_TAGS,
} from '../server/services/royalroad.server';
import type { BookSearchParams } from '../server/services/royalroad.server';

async function testFunctions() {
  try {
    console.log('Testing database functions...\n');
    console.log('Available tags:', LITRPG_RELATED_TAGS);

    // First, let's check what's in our database
    console.log('\nChecking database contents:');
    const totalBooks = await prisma.book.count();
    const totalStats = await prisma.bookStats.count();
    console.log(`Total books in database: ${totalBooks}`);
    console.log(`Total stats entries in database: ${totalStats}`);

    // Check tags distribution
    const books = await prisma.book.findMany({
      select: { tags: true }
    });
    const tagCounts: Record<string, number> = {};
    books.forEach(book => {
      book.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    console.log('\nTag distribution in database:');
    Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([tag, count]) => {
        console.log(`${tag}: ${count} books`);
      });

    // Test 1: Get LitRPG Books
    console.log('\nTest 1: Getting LitRPG Books...');
    console.log('Searching for books with tags:', LITRPG_RELATED_TAGS);
    const litRPGBooks = await getLitRPGBooks();
    console.log(`Found ${litRPGBooks.length} LitRPG books`);
    if (litRPGBooks.length > 0) {
      console.log('Sample books:');
      litRPGBooks.slice(0, 3).forEach(book => {
        console.log(`- ${book.title} by ${book.author.name}`);
        console.log(`  Tags: ${book.tags.join(', ')}`);
        console.log(`  Rating: ${book.rating}, Followers: ${book.stats?.followers}`);
      });
    } else {
      console.log('No LitRPG books found. Checking database directly...');
      const dbBooks = await prisma.book.findMany({
        where: {
          tags: {
            hasSome: Array.from(LITRPG_RELATED_TAGS),
          },
        },
        include: {
          stats: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        take: 3,
      });
      console.log(`Direct database query found ${dbBooks.length} books`);
      dbBooks.forEach(book => {
        console.log(`- ${book.title} (Tags: ${book.tags.join(', ')})`);
      });
    }
    console.log('\n');

    // Test 2: Get Trending Books
    console.log('Test 2: Getting Trending Books...');
    const trendingBooks = await getTrendingLitRPGBooks(5);
    console.log(`Found ${trendingBooks.length} trending books`);
    if (trendingBooks.length > 0) {
      console.log('Top 5 trending books:');
      trendingBooks.forEach(book => {
        console.log(`- ${book.title}`);
        console.log(`  Rating: ${book.rating}, Followers: ${book.stats?.followers}`);
        console.log(`  Tags: ${book.tags.join(', ')}`);
      });
    } else {
      console.log('No trending books found. Checking database directly...');
      const dbBooks = await prisma.book.findMany({
        include: {
          stats: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: {
          stats: {
            _count: 'desc',
          },
        },
        take: 5,
      });
      console.log(`Direct database query found ${dbBooks.length} books`);
      dbBooks.forEach(book => {
        console.log(`- ${book.title}`);
        console.log(`  Tags: ${book.tags.join(', ')}`);
      });
    }
    console.log('\n');

    // Test 3: Search Books with Filters
    console.log('Test 3: Searching Books with Filters...');
    const searchParams: BookSearchParams = {
      tags: ['litrpg'],
      minRating: 4.0,
      sortBy: 'rating',
      limit: 5,
    };
    console.log('Search parameters:', searchParams);
    const searchResults = await searchBooks(searchParams);
    console.log(`Found ${searchResults.length} books matching search criteria`);
    if (searchResults.length > 0) {
      console.log('Search results:');
      searchResults.forEach(book => {
        console.log(`- ${book.title}`);
        console.log(`  Rating: ${book.rating}, Tags: ${book.tags.join(', ')}`);
      });
    } else {
      console.log('No search results found. Checking database directly...');
      const dbBooks = await prisma.book.findMany({
        where: {
          tags: {
            hasSome: searchParams.tags,
          },
        },
        include: {
          stats: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        take: 5,
      });
      console.log(`Direct database query found ${dbBooks.length} books`);
      dbBooks.forEach(book => {
        console.log(`- ${book.title} (Tags: ${book.tags.join(', ')})`);
      });
    }
    console.log('\n');

    // Test 4: Get Similar Books
    if (litRPGBooks.length > 0) {
      console.log('Test 4: Getting Similar Books...');
      const sampleBook = litRPGBooks[0];
      console.log(`Finding books similar to: ${sampleBook.title}`);
      console.log(`Sample book tags: ${sampleBook.tags.join(', ')}`);
      const similarBooks = await getSimilarBooks(sampleBook.id, 3);
      console.log(`Found ${similarBooks.length} similar books`);
      similarBooks.forEach(book => {
        console.log(`- ${book.title}`);
        console.log(`  Matching tags: ${book.tags.join(', ')}`);
      });
      console.log('\n');
    }

    // Test 5: Get Author Books
    if (litRPGBooks.length > 0) {
      console.log('Test 5: Getting Author Books...');
      const sampleAuthor = litRPGBooks[0].author.name;
      console.log(`Finding books by author: ${sampleAuthor}`);
      const authorBooks = await getAuthorBooks(sampleAuthor);
      console.log(`Found ${authorBooks.length} books by this author`);
      if (authorBooks.length > 0) {
        authorBooks.forEach(book => {
          console.log(`- ${book.title}`);
          console.log(`  Rating: ${book.rating}, Tags: ${book.tags.join(', ')}`);
        });
      } else {
        console.log('No author books found. Checking database directly...');
        const dbBooks = await prisma.book.findMany({
          where: {
            authorName: sampleAuthor,
          },
          include: {
            stats: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
        console.log(`Direct database query found ${dbBooks.length} books`);
        dbBooks.forEach(book => {
          console.log(`- ${book.title}`);
        });
      }
    }

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testFunctions(); 