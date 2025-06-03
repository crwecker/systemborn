import { JSDOM, ConstructorOptions as JSDOMOptions } from "jsdom";
import type { Book } from "../../src/types/book";
import { prisma } from "../lib/prisma";
import { Source } from "../generated/prisma";

const ROYALROAD_BASE_URL = "https://www.royalroad.com";

// JSDOM configuration for serverless environment
const JSDOM_OPTIONS: JSDOMOptions = {
  pretendToBeVisual: true,
  runScripts: "outside-only",
  resources: "usable"
};

// Helper function to convert scraped data to database format
function convertToDbBook(scrapedBook: Book) {
  return {
    id: scrapedBook.id,
    title: scrapedBook.title,
    authorName: scrapedBook.author.name,
    description: scrapedBook.description,
    tags: scrapedBook.tags,
    coverUrl: scrapedBook.coverUrl,
    sourceUrl: scrapedBook.url,
    source: Source.ROYAL_ROAD,
  };
}

function convertToDbStats(scrapedBook: Book) {
  return {
    rating: scrapedBook.rating || 0,
    followers: scrapedBook.stats?.followers || 0,
    views: scrapedBook.stats?.views?.total || 0,
    pages: scrapedBook.stats?.pages || 0,
  };
}

// Helper function to extract author name from HTML element
function extractAuthorName(element: Element): string {
  // Try to find author name using multiple selectors in order of preference
  let authorName = "Unknown Author";

  // 1. Try fiction-info container with author heading
  const authorContainer = element.querySelector(".fiction-info");
  if (authorContainer) {
    const authorElement = authorContainer.querySelector("h4.author a");
    if (authorElement) {
      authorName = authorElement.textContent?.trim() || "Unknown Author";
    }
  }

  // 2. Try fiction-list-item__author (used in popular books list)
  if (authorName === "Unknown Author") {
    const listAuthorElement = element.querySelector(
      ".fiction-list-item__author"
    );
    if (listAuthorElement) {
      authorName = listAuthorElement.textContent?.trim() || "Unknown Author";
    }
  }

  // 3. Try alternative author selectors
  if (authorName === "Unknown Author") {
    const altAuthorElement =
      element.querySelector(".fiction-author a") ||
      element.querySelector(".author a") ||
      element.querySelector("a[href^='/profile/']") ||
      element.querySelector(".profile-info a");
    if (altAuthorElement) {
      authorName = altAuthorElement.textContent?.trim() || "Unknown Author";
    }
  }

  return authorName;
}

export async function getPopularBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    const html = await response.text();

    // Create a DOM using jsdom with serverless-friendly options
    const dom = new JSDOM(html, JSDOM_OPTIONS);
    const doc = dom.window.document;

    // Find all fiction entries
    const fictionElements = doc.querySelectorAll(".fiction-list-item");
    const books = Array.from(fictionElements).map((element): Book => {
      const titleElement = element.querySelector(".fiction-title");
      const authorName = extractAuthorName(element);
      const tagsElements = element.querySelectorAll(".tags a");
      const imageElement = element.querySelector("img");
      const descriptionElement = element.querySelector(".description");
      const statsElements = element.querySelectorAll(".stats .col-sm-6");
      const id = element.getAttribute("data-id") || "";
      const url = `${ROYALROAD_BASE_URL}/fiction/${id}`;
      const rating = parseFloat(
        element.querySelector(".rating")?.textContent?.trim() || "0"
      );
      const coverUrl = imageElement?.getAttribute("src") || "";

      const stats: any = {};
      statsElements.forEach((stat) => {
        const label = stat
          .querySelector("label")
          ?.textContent?.trim()
          .toLowerCase();
        const value = stat.textContent?.replace(label || "", "").trim();
        if (label && value) {
          stats[label] = value;
        }
      });

      return {
        id,
        title: titleElement?.textContent?.trim() || "",
        author: {
          name: authorName,
        },
        tags: Array.from(tagsElements).map(
          (tag) => tag.textContent?.trim() || ""
        ),
        image: imageElement?.getAttribute("src") || "",
        description: descriptionElement?.textContent?.trim() || "",
        stats: {
          followers: parseInt(stats["followers"]?.replace(/,/g, "") || "0", 10),
          pages: parseInt(stats["pages"]?.replace(/,/g, "") || "0", 10),
          views: {
            total: parseInt(stats["total views"]?.replace(/,/g, "") || "0", 10),
            average: 0,
          },
          score: {
            total: parseFloat(stats["rating"]?.split(" ")[0] || "0"),
            average: parseFloat(stats["rating"]?.split(" ")[0] || "0"),
          },
        },
        url,
        rating,
        coverUrl,
      };
    });

    // Store books and their stats in the database
    await Promise.all(
      books.map(async (book) => {
        const dbBook = convertToDbBook(book);
        const dbStats = convertToDbStats(book);

        // Upsert the book
        await prisma.book.upsert({
          where: { id: book.id },
          update: dbBook,
          create: dbBook,
        });

        // Create new stats entry
        await prisma.bookStats.create({
          data: {
            ...dbStats,
            book: { connect: { id: book.id } },
          },
        });
      })
    );

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

export async function fetchBooks(page: number = 1): Promise<BookListResponse> {
  try {
    const response = await fetch(
      `${ROYALROAD_BASE_URL}/fictions/best-rated?page=${page}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch books from Royal Road");
    }

    const html = await response.text();
    const dom = new JSDOM(html, JSDOM_OPTIONS);
    const document = dom.window.document;

    const fictionElements = document.querySelectorAll(".fiction-list-item");
    const books: Book[] = Array.from(fictionElements).map((element): Book => {
      const titleElement = element.querySelector(".fiction-title a");
      const authorName = extractAuthorName(element);
      const tagsElements = element.querySelectorAll(".tags a");
      const imageElement = element.querySelector("img");
      const descriptionElement = element.querySelector(".description");
      const ratingElement = element.querySelector(".rating");
      const statsElement = element.querySelector(".stats");

      // Get the full URL path from the title link
      const urlPath = titleElement?.getAttribute("href") || "";
      const url = urlPath ? `${ROYALROAD_BASE_URL}${urlPath}` : "";

      // Extract ID from URL path
      const id = urlPath.split("/")[2] || "";

      const rating = parseFloat(ratingElement?.textContent?.trim() || "0");

      // Parse stats
      const stats = {
        followers: 0,
        views: { total: 0 },
        pages: 0,
      };

      if (statsElement) {
        const statsText = statsElement.textContent || "";
        const followersMatch = statsText.match(/(\d+(?:,\d+)*)\s+Followers/);
        const viewsMatch = statsText.match(/(\d+(?:,\d+)*)\s+Views/);
        const pagesMatch = statsText.match(/(\d+(?:,\d+)*)\s+Pages/);

        if (followersMatch) {
          stats.followers = parseInt(followersMatch[1].replace(/,/g, ""), 10);
        }
        if (viewsMatch) {
          stats.views.total = parseInt(viewsMatch[1].replace(/,/g, ""), 10);
        }
        if (pagesMatch) {
          stats.pages = parseInt(pagesMatch[1].replace(/,/g, ""), 10);
        }
      }

      const book = {
        id,
        title: titleElement?.textContent?.trim() || "",
        author: {
          name: authorName,
        },
        description: descriptionElement?.textContent?.trim() || "",
        tags: Array.from(tagsElements).map(
          (tag) => tag.textContent?.trim() || ""
        ),
        image: imageElement?.getAttribute("src") || "",
        url,
        rating,
        coverUrl: imageElement?.getAttribute("src") || "",
        stats,
      };

      return book;
    });

    // Get pagination info
    const paginationElement = document.querySelector(".pagination");
    const lastPageElement = paginationElement?.querySelector("li:last-child a");
    const totalPages = lastPageElement
      ? parseInt(lastPageElement.getAttribute("data-page") || "1", 10)
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

export async function fetchBookDetails(bookId: string): Promise<Book> {
  try {
    // First check if we have the book in our database
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
      // Convert database book to API format
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
        stats: {
          followers: existingBook.stats[0]?.followers || 0,
          pages: existingBook.stats[0]?.pages || 0,
          views: {
            total: existingBook.stats[0]?.views || 0,
          },
        },
      };
    }

    // If not in database, fetch from Royal Road
    const response = await fetch(`${ROYALROAD_BASE_URL}/fiction/${bookId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch book details from Royal Road");
    }

    const html = await response.text();
    const dom = new JSDOM(html, JSDOM_OPTIONS);
    const document = dom.window.document;

    const titleElement = document.querySelector(".fic-title h1");
    const authorName = extractAuthorName(document.documentElement);
    const descriptionElement = document.querySelector(".description");
    const tagsElements = document.querySelectorAll(".tags a");
    const ratingElement = document.querySelector(".rating-content");
    const coverElement = document.querySelector(".cover-art-container img");
    const statsElement = document.querySelector(".stats");

    const rating = parseFloat(ratingElement?.textContent?.trim() || "0");

    // Parse stats
    const stats = {
      followers: 0,
      views: { total: 0 },
      pages: 0,
    };

    if (statsElement) {
      const statsText = statsElement.textContent || "";
      const followersMatch = statsText.match(/(\d+(?:,\d+)*)\s+Followers/);
      const viewsMatch = statsText.match(/(\d+(?:,\d+)*)\s+Views/);
      const pagesMatch = statsText.match(/(\d+(?:,\d+)*)\s+Pages/);

      if (followersMatch) {
        stats.followers = parseInt(followersMatch[1].replace(/,/g, ""), 10);
      }
      if (viewsMatch) {
        stats.views.total = parseInt(viewsMatch[1].replace(/,/g, ""), 10);
      }
      if (pagesMatch) {
        stats.pages = parseInt(pagesMatch[1].replace(/,/g, ""), 10);
      }
    }

    const book = {
      id: bookId,
      title: titleElement?.textContent?.trim() || "",
      author: {
        name: authorName,
      },
      description: descriptionElement?.textContent?.trim() || "",
      tags: Array.from(tagsElements).map(
        (tag) => tag.textContent?.trim() || ""
      ),
      image: coverElement?.getAttribute("src") || "",
      url: `${ROYALROAD_BASE_URL}/fiction/${bookId}`,
      rating,
      coverUrl: coverElement?.getAttribute("src") || "",
      stats,
    };

    // Store in database
    const dbBook = convertToDbBook(book);
    await prisma.book.upsert({
      where: { id: book.id },
      update: dbBook,
      create: dbBook,
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
        book: { connect: { id: bookId } },
      },
    });
  } catch (error) {
    console.error(`Error updating stats for book ${bookId}:`, error);
    throw error;
  }
}

// New function to get books by tags
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
    stats: {
      followers: book.stats[0]?.followers || 0,
      pages: book.stats[0]?.pages || 0,
      views: {
        total: book.stats[0]?.views || 0,
        average: 0,
      },
      score: {
        total: book.stats[0]?.rating || 0,
        average: book.stats[0]?.rating || 0,
      },
    },
  }));
}

// Constants for our target genres
export const LITRPG_RELATED_TAGS = [
  "litrpg",
  "gamelit",
  "progression",
  "xianxia",
  "cultivation",
  "portal fantasy",
  "isekai",
  "dungeon",
  "system",
  "apocalypse",
] as const;

type LitRPGTag = (typeof LITRPG_RELATED_TAGS)[number];

export interface BookSearchParams {
  tags?: string[];
  minRating?: number;
  minPages?: number;
  onlyCompleted?: boolean;
  sortBy?: "rating" | "followers" | "views" | "pages" | "latest";
  limit?: number;
  offset?: number;
}

// Get all books that match our target genres
export async function getLitRPGBooks(): Promise<Book[]> {
  const books = await prisma.book.findMany({
    where: {
      OR: LITRPG_RELATED_TAGS.map((tag) => ({
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

  return convertBooksToApiFormat(books);
}

// Get trending books in our target genres
export async function getTrendingLitRPGBooks(
  limit: number = 10
): Promise<Book[]> {
  const books = await prisma.book.findMany({
    where: {
      OR: LITRPG_RELATED_TAGS.map((tag) => ({
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

// Helper function to convert database books to API format
function convertBooksToApiFormat(books: any[]): Book[] {
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
    rating: book.stats?.[0]?.rating || 0,
    coverUrl: book.coverUrl || "",
    stats: {
      followers: book.stats?.[0]?.followers || 0,
      pages: book.stats?.[0]?.pages || 0,
      views: {
        total: book.stats?.[0]?.views || 0,
      },
    },
  }));
}

// Advanced search function with filtering
export async function searchBooks(params: BookSearchParams): Promise<Book[]> {
  const {
    tags = [],
    minRating = 0,
    minPages = 0,
    onlyCompleted = false,
    sortBy = "rating",
    limit = 50,
    offset = 0,
  } = params;

  // Build the where clause
  const where: any = {};

  if (tags.length > 0) {
    where.OR = tags.map((tag) => ({
      tags: {
        hasSome: [
          tag,
          tag.toLowerCase(),
          tag.toUpperCase(),
          tag.charAt(0).toUpperCase() + tag.slice(1),
        ],
      },
    }));
  }

  // Include stats for filtering
  const books = await prisma.book.findMany({
    where,
    include: {
      stats: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: limit,
    skip: offset,
  });

  // Post-process to apply filters and sort
  const filteredBooks = books.filter((book) => {
    const latestStats = book.stats?.[0];
    if (!latestStats) return false;

    if (minRating && latestStats.rating < minRating) return false;
    if (minPages && latestStats.pages < minPages) return false;

    return true;
  });

  // Sort the filtered books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
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

  return convertBooksToApiFormat(sortedBooks);
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
