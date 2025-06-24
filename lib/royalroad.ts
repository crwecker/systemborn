import { parse } from 'node-html-parser';
import type { Book } from "../src/types/book";
import { PrismaClient } from "@prisma/client";
import Fuse from 'fuse.js';

// Define Source enum to match Prisma schema
export enum Source {
  ROYAL_ROAD = 'ROYAL_ROAD'
}

// We'll get the Prisma instance from the API handler
let prisma: PrismaClient;

export function setPrismaInstance(instance: PrismaClient) {
  prisma = instance;
}

const ROYALROAD_BASE_URL = "https://www.royalroad.com";

// Helper function to generate a random ID if we can't extract one from the URL
function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Helper function to convert scraped data to database format
export function convertToDbBook(scrapedBook: Book) {
  const dbBook = {
    id: scrapedBook.id,
    title: scrapedBook.title,
    authorName: scrapedBook.author.name || "Unknown Author",
    description: scrapedBook.description,
    tags: scrapedBook.tags,
    coverUrl: scrapedBook.coverUrl,
    sourceUrl: scrapedBook.url,
    source: Source.ROYAL_ROAD,
    contentWarnings: scrapedBook.contentWarnings || [],
  };
  console.log('Converted DB Book object:', dbBook);
  return dbBook;
}

// Define the stats type
interface BookStats {
  followers: number;
  views: {
    total: number;
    average: number;
  };
  pages: number;
  favorites: number;
  ratings_count: number;
  overall_score: number;
  style_score: number;
  story_score: number;
  grammar_score: number;
  character_score: number;
}

// Helper function to create a default stats object
function createDefaultStats(): BookStats {
  return {
    followers: 0,
    views: { total: 0, average: 0 },
    pages: 0,
    favorites: 0,
    ratings_count: 0,
    overall_score: 0,
    style_score: 0,
    story_score: 0,
    grammar_score: 0,
    character_score: 0
  };
}

// Helper function to convert scraped data to database format
function convertToDbStats(scrapedBook: Book) {
  const stats = scrapedBook.stats || createDefaultStats();
  return {
    rating: scrapedBook.rating || 0,
    followers: stats.followers || 0,
    views: stats.views.total || 0,
    average_views: stats.views.average || 0,
    favorites: stats.favorites || 0,
    ratings_count: stats.ratings_count || 0,
    pages: stats.pages || 0,
    overall_score: stats.overall_score || 0,
    style_score: stats.style_score || 0,
    story_score: stats.story_score || 0,
    grammar_score: stats.grammar_score || 0,
    character_score: stats.character_score || 0
  };
}

// Helper function to extract author name from HTML element
function extractAuthorName(element: any): string {
  // Try to find author name using multiple selectors in order of preference
  const authorSelectors = [
    '.profile-info a',           // Author profile link in header
    '.author-name-container a',  // Author name in book details
    '.author-name a',           // Alternative author name container
    'a[href^="/profile/"]',     // Any profile link
    '.fiction-info a[href^="/profile/"]' // Profile link in fiction info
  ];

  for (const selector of authorSelectors) {
    const authorElement = element.querySelector(selector);
    if (authorElement && authorElement.text) {
      const name = authorElement.text.trim();
      if (name && name !== '') {
        return name;
      }
    }
  }

  return "Unknown Author";
}

// Add timeout and retry logic for fetch
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

// Helper function to parse numbers safely
function parseNumber(value: string | undefined | null, defaultValue = 0): number {
  if (!value) return defaultValue;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseRating(element: any): number {
  // Get rating from the star's title attribute
  const starElement = element.querySelector('.star');
  if (starElement) {
    const ratingTitle = starElement.getAttribute('title');
    console.log('Rating title:', ratingTitle);
    if (ratingTitle) {
      // Extract the rating value from the title (e.g. "4.5/5")
      const rating = parseFloat(ratingTitle);
      if (!isNaN(rating)) {
        return rating;
      }
    }
  }
  return 0;
}

export async function getPopularBooks(): Promise<Book[]> {
  try {
    const response = await fetchWithRetry(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    const html = await response.text();
    const root = parse(html);

    // Process in smaller batches to reduce memory usage
    const fictionElements = root.querySelectorAll(".fiction-list-item");
    const books: Book[] = [];

    for (const element of fictionElements) {
      try {
        const titleElement = element.querySelector(".fiction-title");
        const authorName = extractAuthorName(element);
        const tagsElements = element.querySelectorAll(".tags a");
        const imageElement = element.querySelector("img[data-type='cover']");
        const descriptionElement = element.querySelector(".description");
        const id = element.getAttribute("data-id") || "";

        if (!id) continue; // Skip invalid entries
        const contentWarnings = parseContentWarnings(element);
        console.log('Found content warnings:', contentWarnings);

        const book: Book = {
          id,
          title: titleElement?.text?.trim() || "",
          author: { name: authorName },
          tags: Array.from(tagsElements).map(tag => tag.text?.trim() || "").filter(Boolean),
          image: imageElement?.getAttribute("src") || "",
          description: descriptionElement?.text?.trim() || "",
          url: `${ROYALROAD_BASE_URL}/fiction/${id}`,
          rating: parseRating(element),
          coverUrl: imageElement?.getAttribute("src") || "",
          contentWarnings,
          source: 'ROYAL_ROAD',
          stats: {
            followers: 0,
            pages: 0,
            views: { total: 0, average: 0 },
            favorites: 0,
            ratings_count: 0,
            overall_score: 0,
            style_score: 0,
            story_score: 0,
            grammar_score: 0,
            character_score: 0
          }
        };

        // Parse stats separately to avoid memory issues
        const statsElements = element.querySelectorAll(".stats .col-sm-6");
        statsElements.forEach(stat => {
          const label = stat.querySelector("label")?.text?.trim().toLowerCase();
          const value = stat.text?.replace(label || "", "").trim() || "0";
          
          if (book.stats) {  // Add null check
            switch (label) {
              case "followers":
                book.stats.followers = parseNumber(value);
                break;
              case "pages":
                book.stats.pages = parseNumber(value);
                break;
              case "total views":
                if (book.stats.views) {  // Add null check
                  book.stats.views.total = parseNumber(value);
                }
                break;
            }
          }
        });

        books.push(book);

        // Store in database immediately to reduce memory usage
        const dbBook = convertToDbBook(book);
        const dbStats = convertToDbStats(book);

        console.log('About to upsert book with data:', dbBook);
        await prisma.book.upsert({
          where: { id: book.id },
          update: dbBook,
          create: dbBook,
        });

        await prisma.bookStats.create({
          data: {
            ...dbStats,
            book: { connect: { id: book.id } },
          },
        });
      } catch (error) {
        console.error('Error processing book:', error);
        continue; // Skip this book on error
      }
    }

    return books;
  } catch (error) {
    console.error("Error fetching popular books:", error);
    return [];
  }
}

interface BookListResponse {
  books: Book[];
  totalPages: number;
  currentPage: number;
}

// Update fetchBooks function to use the correct element for stats
export async function fetchBooks(page: number = 1): Promise<BookListResponse> {
  try {
    const response = await fetch(
      `${ROYALROAD_BASE_URL}/fictions/best-rated?page=${page}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch books from Royal Road");
    }

    const html = await response.text();
    const root = parse(html);

    const books: Book[] = [];
    const fictionElements = root.querySelectorAll(".fiction-list > .row");

    for (const element of fictionElements) {
      try {
        const titleElement = element.querySelector("h2.fiction-title a");
        const titleLink = titleElement?.getAttribute("href") || "";
        const bookUrl = `${ROYALROAD_BASE_URL}${titleLink}`;
        
        // Fetch individual book page
        const bookResponse = await fetch(bookUrl);
        if (!bookResponse.ok) {
          throw new Error(`Failed to fetch book page: ${bookUrl}`);
        }
        const bookHtml = await bookResponse.text();
        const bookRoot = parse(bookHtml);
        
        // Get author name
        let authorName = "Unknown Author";
        const authorSelectors = [
          '.profile-info a',
          '.author-name-container a',
          '.author-name a',
          'a[href^="/profile/"]',
          '.fiction-info a[href^="/profile/"]'
        ];
        
        for (const selector of authorSelectors) {
          const authorElement = bookRoot.querySelector(selector);
          if (authorElement && authorElement.text) {
            const name = authorElement.text.trim();
            if (name && name !== '') {
              authorName = name;
              break;
            }
          }
        }

        const id = titleLink.split('/').filter(Boolean).pop() || generateRandomId();
        
        const contentWarnings = parseContentWarnings(bookRoot);
        console.log('Found content warnings:', contentWarnings);
        const book: Book = {
          id,
          title: titleElement?.text?.trim() || "",
          author: { name: authorName },
          tags: Array.from(element.querySelectorAll(".tags a") || [])
            .map((tag: any) => tag.text?.trim() || "")
            .filter(Boolean),
          image: element.querySelector("img[data-type='cover']")?.getAttribute("src") || "",
          description: parseDescription(bookRoot),
          url: bookUrl,
          rating: parseRating(element),
          coverUrl: element.querySelector("img[data-type='cover']")?.getAttribute("src") || "",
          contentWarnings,
          source: 'ROYAL_ROAD',
          stats: parseStats(bookRoot)
        };

        console.log(`Processed book: ${book.title} by ${book.author.name} (Rating: ${book.rating})`);
        console.log(`Stats: Views: ${book.stats?.views.total} (avg: ${book.stats?.views.average}), Followers: ${book.stats?.followers}, Favorites: ${book.stats?.favorites}, Ratings: ${book.stats?.ratings_count}`);
        books.push(book);
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error processing book:", error);
      }
    }

    const paginationElement = root.querySelector(".pagination");
    const lastPageElement = paginationElement?.querySelector("li:last-child a");
    const totalPages = lastPageElement
      ? parseInt(lastPageElement.getAttribute("href")?.split("=")[1] || "1")
      : 1;

    return {
      books,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}

export async function fetchBookDetails(bookId: string, forceFresh: boolean = false): Promise<Book> {
  try {
    // First check if we have the book in our database (unless forcing fresh data)
    if (!forceFresh) {
      const existingBook = await prisma.book.findUnique({
        where: { id: bookId },
        include: {
          stats: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (existingBook) {
        return {
          id: existingBook.id,
          title: existingBook.title,
          author: {
            name: existingBook.authorName,
          },
          description: existingBook.description,
          tags: existingBook.tags,
          image: existingBook.coverUrl || "",
          url: existingBook.sourceUrl,
          rating: existingBook.stats[0]?.rating || 0,
          coverUrl: existingBook.coverUrl || "",
          contentWarnings: existingBook.contentWarnings || [],
          source: existingBook.source as 'ROYAL_ROAD' | 'AMAZON',
          stats: {
            followers: existingBook.stats[0]?.followers || 0,
            views: {
              total: existingBook.stats[0]?.views || 0,
              average: existingBook.stats[0]?.average_views || 0
            },
            pages: existingBook.stats[0]?.pages || 0,
            favorites: existingBook.stats[0]?.favorites || 0,
            ratings_count: existingBook.stats[0]?.ratings_count || 0,
            overall_score: existingBook.stats[0]?.overall_score || 0,
            style_score: existingBook.stats[0]?.style_score || 0,
            story_score: existingBook.stats[0]?.story_score || 0,
            grammar_score: existingBook.stats[0]?.grammar_score || 0,
            character_score: existingBook.stats[0]?.character_score || 0
          },
        };
      }
    }

    // If not in database, fetch from Royal Road
    console.log(`Fetching fresh book details for ID: ${bookId}`);
    const response = await fetchWithRetry(`${ROYALROAD_BASE_URL}/fiction/${bookId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch book details from Royal Road: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const root = parse(html);

    const titleElement = root.querySelector(".fic-title h1");
    const authorName = extractAuthorName(root);
    const descriptionElement = root.querySelector(".description");
    const tagsElements = root.querySelectorAll(".tags a");
    const coverElement = root.querySelector("img[data-type='cover']");
    const rating = parseRating(root);
    const stats = parseStats(root) || { ...defaultStats };
    const contentWarnings = parseContentWarnings(root);
    console.log('Found content warnings:', contentWarnings);

    const book: Book = {
      id: bookId,
      title: titleElement?.text.trim() || "",
      author: { name: authorName },
      description: parseDescription(root),
      tags: tagsElements.map((tag) => tag.text.trim()),
      image: coverElement?.getAttribute("src") || "",
      url: `${ROYALROAD_BASE_URL}/fiction/${bookId}`,
      rating,
      coverUrl: coverElement?.getAttribute("src") || "",
      contentWarnings,
      source: 'ROYAL_ROAD',
      stats
    };

    // Store in database
    const dbBook = convertToDbBook(book);
    const dbStats = convertToDbStats(book);

    console.log('About to upsert book with data:', dbBook);
    await prisma.book.upsert({
      where: { id: book.id },
      update: dbBook,
      create: dbBook,
    });

    await prisma.bookStats.create({
      data: {
        ...dbStats,
        bookId: book.id,
      },
    });

    return book;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
}

// New function to update stats for a specific book
export async function updateBookStats(bookId: string): Promise<void> {
  try {
    const book = await fetchBookDetails(bookId);
    const dbStats = convertToDbStats(book);

    await prisma.bookStats.create({
      data: {
        ...dbStats,
        bookId: book.id,
      },
    });
  } catch (error) {
    console.error(`Error updating stats for book ${bookId}:`, error);
    throw error;
  }
}

// Update getBooksByTags function
export async function getBooksByTags(tags: string[]): Promise<Book[]> {
  const books = await prisma.book.findMany({
    where: {
      tags: {
        hasSome: tags,
      },
    },
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: {
      name: book.authorName,
    },
    description: book.description,
    tags: book.tags,
    image: book.coverUrl || "",
    url: book.sourceUrl,
    rating: book.stats[0]?.rating || 0,
    coverUrl: book.coverUrl || "",
    contentWarnings: book.contentWarnings || [],
    source: book.source as 'ROYAL_ROAD' | 'AMAZON',
    stats: {
      followers: book.stats[0]?.followers || 0,
      views: {
        total: book.stats[0]?.views || 0,
        average: book.stats[0]?.average_views || 0
      },
      pages: book.stats[0]?.pages || 0,
      favorites: book.stats[0]?.favorites || 0,
      ratings_count: book.stats[0]?.ratings_count || 0,
      overall_score: book.stats[0]?.overall_score || 0,
      style_score: book.stats[0]?.style_score || 0,
      story_score: book.stats[0]?.story_score || 0,
      grammar_score: book.stats[0]?.grammar_score || 0,
      character_score: book.stats[0]?.character_score || 0
    },
  }));
}

// New function to fetch actual tags from Royal Road
export async function fetchAvailableTags(): Promise<string[]> {
  try {
    // Fetch a sample of books to gather tags
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    if (!response.ok) {
      throw new Error("Failed to fetch from Royal Road");
    }

    const html = await response.text();
    const root = parse(html);

    // Get all tag elements from the page
    const tagElements = root.querySelectorAll(".tags a");
    
    // Create a Set to store unique tags
    const uniqueTags = new Set<string>();
    
    // Add each tag to the Set
    tagElements.forEach((tag) => {
      const tagText = tag.text?.trim();
      if (tagText) {
        uniqueTags.add(tagText);
      }
    });

    // Convert Set to array and sort alphabetically
    return Array.from(uniqueTags).sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

// Constants for our target genres
// Legacy function - kept for backward compatibility
// Gets books with common LitRPG-related tags

export interface BookSearchParams {
  tags?: string[];
  minRating?: number;
  minPages?: number;
  onlyCompleted?: boolean;
  sortBy?: "rating" | "followers" | "views" | "pages" | "latest";
  limit?: number;
  offset?: number;
  query?: string; // Fuzzy search query
}

// Get all books that match our target genres
export async function getLitRPGBooks(): Promise<Book[]> {
  // Get popular tags dynamically
  const popularTags = await getPopularTags(12);
  
  const books = await prisma.book.findMany({
    where: {
      OR: popularTags.map((tag) => ({
        tags: {
          hasSome: [
            tag,
            tag.toLowerCase(),
            tag.toUpperCase(),
            tag.charAt(0).toUpperCase() + tag.slice(1),
          ],
        },
      })),
    },
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return books.map(book => ({
    id: book.id,
    title: book.title,
    author: {
      name: book.authorName,
    },
    description: book.description,
    tags: book.tags,
    image: book.coverUrl || "",
    url: book.sourceUrl,
    rating: book.stats?.[0]?.rating || 0,
    coverUrl: book.coverUrl || "",
    contentWarnings: book.contentWarnings || [],
    source: book.source as 'ROYAL_ROAD' | 'AMAZON',
    stats: {
      followers: book.stats?.[0]?.followers || 0,
      views: {
        total: book.stats?.[0]?.views || 0,
        average: book.stats?.[0]?.average_views || 0
      },
      pages: book.stats?.[0]?.pages || 0,
      favorites: book.stats?.[0]?.favorites || 0,
      ratings_count: book.stats?.[0]?.ratings_count || 0,
      overall_score: book.stats?.[0]?.overall_score || 0,
      style_score: book.stats?.[0]?.style_score || 0,
      story_score: book.stats?.[0]?.story_score || 0,
      grammar_score: book.stats?.[0]?.grammar_score || 0,
      character_score: book.stats?.[0]?.character_score || 0
    }
  }));
}

// Get trending books in our target genres
export async function getTrendingLitRPGBooks(
  limit: number = 10
): Promise<Book[]> {
  // Get popular tags dynamically
  const popularTags = await getPopularTags(12);
  
  const books = await prisma.book.findMany({
    where: {
      OR: popularTags.map((tag) => ({
        tags: {
          hasSome: [
            tag,
            tag.toLowerCase(),
            tag.toUpperCase(),
            tag.charAt(0).toUpperCase() + tag.slice(1),
          ],
        },
      })),
    },
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      stats: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return convertBooksToApiFormat(books);
}

// Helper function to create a book object from database data
function createBookFromDb(dbBook: any): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: {
      name: dbBook.authorName,
    },
    description: dbBook.description,
    tags: dbBook.tags,
    image: dbBook.coverUrl || "",
    url: dbBook.sourceUrl,
    rating: dbBook.stats?.[0]?.rating || 0,
    coverUrl: dbBook.coverUrl || "",
    contentWarnings: dbBook.contentWarnings || [],
    source: dbBook.source as 'ROYAL_ROAD' | 'AMAZON',
    stats: {
      followers: dbBook.stats?.[0]?.followers || 0,
      views: {
        total: dbBook.stats?.[0]?.views || 0,
        average: dbBook.stats?.[0]?.average_views || 0
      },
      pages: dbBook.stats?.[0]?.pages || 0,
      favorites: dbBook.stats?.[0]?.favorites || 0,
      ratings_count: dbBook.stats?.[0]?.ratings_count || 0,
      overall_score: dbBook.stats?.[0]?.overall_score || 0,
      style_score: dbBook.stats?.[0]?.style_score || 0,
      story_score: dbBook.stats?.[0]?.story_score || 0,
      grammar_score: dbBook.stats?.[0]?.grammar_score || 0,
      character_score: dbBook.stats?.[0]?.character_score || 0
    }
  };
}

// Update the convertBooksToApiFormat function to use the helper
function convertBooksToApiFormat(books: any[]): Book[] {
  return books.map(createBookFromDb);
}

// Update the defaultStats object to use the helper
const defaultStats = createDefaultStats();

// Advanced search function with filtering
// NOTE: This function only handles Royal Road books. Amazon books are handled 
// separately in the frontend and are always displayed first as featured content.
export async function searchBooks(params: BookSearchParams): Promise<Book[]> {
  const {
    tags = [],
    minRating = 0,
    minPages = 0,
    onlyCompleted = false,
    sortBy = "rating",
    limit = 500,
    offset = 0,
    query = "", // Extract the search query
  } = params;

  // Build the where clause
  const where: any = {};

  // Remove database-level tag filtering - we'll do fuzzy matching in JavaScript
  // if (tags.length > 0) {
  //   where.tags = {
  //     hasSome: tags.flatMap(tag => [
  //       tag,
  //       tag.toLowerCase(),
  //       tag.toUpperCase(),
  //       tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
  //     ])
  //   };
  // }

  // When filtering by tags or sorting, we need to fetch all books since we're filtering/sorting in JavaScript
  // Only use the limit when we have both no tags AND no search query AND no sorting (just pagination)
  const needsClientSideProcessing = tags.length > 0 || (query && query.trim()) || sortBy !== "rating";
  const searchLimit = needsClientSideProcessing ? undefined : limit;

  // Include stats for filtering
  const books = await prisma.book.findMany({
    where,
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: searchLimit,
    skip: offset,
  });

  // Post-process to apply filters including fuzzy tag matching
  const filteredBooks = books.filter((book) => {
    const latestStats = book.stats?.[0];
    if (!latestStats) return false;

    if (minRating && latestStats.rating < minRating) return false;
    if (minPages && latestStats.pages < minPages) return false;

    // Apply fuzzy tag filtering
    if (tags.length > 0) {
      const bookTags = book.tags.map(tag => tag.toLowerCase());
      const selectedTags = tags.map(tag => tag.toLowerCase());
      
      // ALL selected tags must match (AND logic)
      const hasAllMatchingTags = selectedTags.every(selectedTag => 
        bookTags.some(bookTag => bookTag.includes(selectedTag))
      );
      
      if (!hasAllMatchingTags) return false;
    }

    return true;
  });

  let processedBooks = filteredBooks;

  // Apply fuzzy search if query is provided
  if (query && query.trim()) {
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'authorName', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.4, // Lower = more strict matching
      includeScore: true,
    };

    const fuse = new Fuse(filteredBooks, fuseOptions);
    const searchResults = fuse.search(query.trim());
    
    // Extract items from Fuse results and sort by score, then apply limit
    processedBooks = searchResults.map(result => result.item).slice(0, limit);
  } else {
    // Sort the filtered books only if no fuzzy search is applied
    processedBooks = [...filteredBooks].sort((a, b) => {
      const statsA = a.stats?.[0];
      const statsB = b.stats?.[0];

      if (!statsA || !statsB) return 0;

      switch (sortBy) {
        case "rating":
          return statsB.rating - statsA.rating;
        case "followers":
          return statsB.followers - statsA.followers;
        case "views":
          return statsB.views - statsA.views;
        case "pages":
          return statsB.pages - statsA.pages;
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
    
    // Apply limit after sorting when we performed client-side processing
    if (needsClientSideProcessing) {
      processedBooks = processedBooks.slice(0, limit);
    }
  }

  return convertBooksToApiFormat(processedBooks);
}

// Get similar books based on tags
export async function getSimilarBooks(
  bookId: string,
  limit: number = 5
): Promise<Book[]> {
  // First get the book's tags
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { tags: true },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  // Find books with similar tags
  return searchBooks({
    tags: book.tags,
    limit,
    sortBy: "rating",
  });
}

// Get books by a specific author
export async function getAuthorBooks(authorName: string): Promise<Book[]> {
  if (!authorName) {
    throw new Error("Author name is required");
  }

  const books = await prisma.book.findMany({
    where: {
      authorName: {
        equals: authorName,
        mode: "insensitive", // Case insensitive search
      },
    },
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return convertBooksToApiFormat(books);
}

// Add these helper functions near the top with other helper functions

function parseContentWarnings(root: any): string[] {
  // Look for the warning span
  const warningSpan = root.querySelector('span:contains("This fiction contains:")');
  console.log('Found warning span:', warningSpan);
  if (!warningSpan) return [];

  // Get the parent div and find all list items
  const warningList = warningSpan.parentNode.querySelectorAll('li');
  console.log('Found warning list:', warningList);
  if (!warningList) return [];

  // Extract warnings from list items
  const warnings = Array.from(warningList).map((item: any) => item.text.trim());
  console.log('Found warnings:', warnings);
  return Array.from(warningList).map((item: any) => item.text.trim()).filter(Boolean);
}

function parseDescription(root: any): string {
  const descriptionDiv = root.querySelector('.description');
  if (!descriptionDiv) return "";
  const fullText = descriptionDiv.text.trim();
  return fullText.replace(/SHOW MORE|SHOW LESS/gi, '').trim();
}

function parseStats(element: any): BookStats {
  const statsContent = element.querySelector('.fiction-stats .stats-content');
  if (!statsContent) {
    console.log('No fiction-stats .stats-content found');
    return { ...defaultStats };
  }

  const stats = { ...defaultStats };

  // Parse the scores from the first column (star ratings)
  const firstColumn = statsContent.querySelector('.col-sm-6:first-child');
  if (firstColumn) {
    const starElements = firstColumn.querySelectorAll('.star');
    starElements.forEach((star: any) => {
      const label = star.getAttribute('data-original-title')?.toLowerCase().trim();
      const ariaLabel = star.getAttribute('aria-label');
      if (!label || !ariaLabel) return;

      // Extract score from aria-label (e.g. "4.77 stars")
      const scoreMatch = ariaLabel.match(/(\d+(\.\d+)?)/);
      if (!scoreMatch) return;

      const score = parseFloat(scoreMatch[1]);
      if (isNaN(score)) return;

      console.log('Processing score:', score, 'for label:', label);

      if (label.includes('overall')) stats.overall_score = score;
      else if (label.includes('style')) stats.style_score = score;
      else if (label.includes('story')) stats.story_score = score;
      else if (label.includes('grammar')) stats.grammar_score = score;
      else if (label.includes('character')) stats.character_score = score;
    });
  }

  // Parse the numeric stats from the second column
  const secondColumn = statsContent.querySelector('.col-sm-6:last-child');
  if (secondColumn) {
    const listItems = secondColumn.querySelectorAll('li');
    
    for (let i = 0; i < listItems.length; i += 2) {
      const labelItem = listItems[i];
      const valueItem = listItems[i + 1];
      
      if (!labelItem || !valueItem) continue;
      
      const label = labelItem.text.trim().toLowerCase();
      const valueText = valueItem.text.trim();
      const value = parseFloat(valueText.replace(/[^\d.]/g, ''));
      
      console.log('Processing stat:', label, '=', valueText, '(parsed:', value, ')');
      
      if (label.includes('total views')) {
        stats.views.total = value;
      } else if (label.includes('average views')) {
        stats.views.average = value;
      } else if (label.includes('followers')) {
        stats.followers = value;
      } else if (label.includes('favorites')) {
        stats.favorites = value;
      } else if (label.includes('ratings')) {
        stats.ratings_count = value;
      } else if (label.includes('pages')) {
        stats.pages = value;
      }
    }
  }

  console.log('Final parsed stats:', stats);
  return stats;
}

// Get the most popular tags from the database
export async function getPopularTags(limit: number = 12): Promise<string[]> {
  try {
    // Get all books with their tags
    const books = await prisma.book.findMany({
      select: { tags: true }
    });

    // Count tag frequency and keep track of the most common case
    const tagFrequency: Record<string, { count: number; originalCase: string }> = {};
    
    books.forEach(book => {
      book.tags.forEach(tag => {
        const lowerTag = tag.toLowerCase();
        if (tagFrequency[lowerTag]) {
          tagFrequency[lowerTag].count += 1;
        } else {
          tagFrequency[lowerTag] = { count: 1, originalCase: tag };
        }
      });
    });

    // Sort tags by frequency (most popular first) and return top N with original case
    const sortedTags = Object.values(tagFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ originalCase }) => originalCase);

    return sortedTags;
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    // Fallback to some common tags if database query fails
    return ['LitRPG', 'Progression', 'GameLit', 'Fantasy', 'Adventure', 'Action'];
  }
}

// Get all unique tags from the database
export async function getAllTags(): Promise<string[]> {
  try {
    // Get all books with their tags
    const books = await prisma.book.findMany({
      select: { tags: true }
    });

    // Create a map to track unique tags and preserve original case
    const uniqueTags: Record<string, string> = {};
    
    books.forEach(book => {
      book.tags.forEach(tag => {
        const lowerTag = tag.toLowerCase();
        if (!uniqueTags[lowerTag]) {
          uniqueTags[lowerTag] = tag; // Keep the first occurrence's case
        }
      });
    });

    // Return all unique tags sorted alphabetically
    return Object.values(uniqueTags).sort();
  } catch (error) {
    console.error('Error fetching all tags:', error);
    // Fallback to some common tags if database query fails
    return ['LitRPG', 'Progression', 'GameLit', 'Fantasy', 'Adventure', 'Action'];
  }
} 