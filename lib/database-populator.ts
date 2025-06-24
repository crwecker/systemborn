import { PrismaClient } from "@prisma/client";
import { setPrismaInstance, fetchBooks, convertToDbBook, fetchBookDetails } from "./royalroad";

export interface PopulationResult {
  processed: number;
  skipped: number;
  errors: number;
  timestamp: string;
}

export interface PopulationOptions {
  maxPages?: number;
  minFollowers?: number;
  prisma?: PrismaClient;
}

export class DatabasePopulator {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    setPrismaInstance(this.prisma);
  }

  async populateDatabase(options: PopulationOptions = {}): Promise<PopulationResult> {
    const {
      maxPages = 5,
      minFollowers = 50,
    } = options;

    try {
      console.log("Starting database population...");

      const today = new Date();
      let processedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Fetch books from specified number of pages
      for (let page = 1; page <= maxPages; page++) {
        console.log(`Fetching page ${page}...`);
        const { books } = await fetchBooks(page);

        console.log(`Processing ${books.length} books from page ${page}`);

        // Process each book
        for (const book of books) {
          console.log(
            `Processing book: ${book.title} by ${book.author.name} (Rating: ${book.rating})`,
          );

          try {
            await this.processBook(book, today, minFollowers);
            processedCount++;
          } catch (error: any) {
            if (error.message === "SKIP_BOOK") {
              // Book was skipped due to insufficient followers
              skippedCount++;
            } else if (error.code === "P2002") {
              // Unique constraint violation - stats already exist for today
              console.log(
                `Stats already exist for ${book.title} today, updating instead...`
              );
              await this.updateExistingStats(book, today);
              processedCount++;
            } else {
              console.error(`Error processing book ${book.title}:`, error);
              errorCount++;
            }
          }
        }

        // Add a small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(`Database population completed! Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

      return {
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in database population:", error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async processBook(book: any, today: Date, minFollowers: number): Promise<void> {
    // Check if book already exists in database
    const existingBook = await this.prisma.book.findUnique({
      where: { id: book.id },
      include: {
        stats: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    let bookToProcess = book;

    if (existingBook) {
      console.log(`Book ${book.title} already exists in database. Using fresh stats from Royal Road...`);
      console.log(`Fresh stats for ${book.title}:`, {
        followers: bookToProcess.stats?.followers,
        views: bookToProcess.stats?.views,
        pages: bookToProcess.stats?.pages,
        favorites: bookToProcess.stats?.favorites,
        ratings_count: bookToProcess.stats?.ratings_count,
        scores: {
          overall: bookToProcess.stats?.overall_score,
          style: bookToProcess.stats?.style_score,
          story: bookToProcess.stats?.story_score,
          grammar: bookToProcess.stats?.grammar_score,
          character: bookToProcess.stats?.character_score,
        }
      });
    } else {
      console.log(`Book ${book.title} is new. Using fresh stats from Royal Road.`);
    }

    // Check if book has minimum followers
    const followerCount = bookToProcess.stats?.followers || 0;
    if (followerCount < minFollowers) {
      console.log(`Skipping ${bookToProcess.title} - only has ${followerCount} followers (minimum: ${minFollowers})`);
      throw new Error("SKIP_BOOK"); // Special error to indicate skipping
    }

    console.log(`Processing ${bookToProcess.title} with ${followerCount} followers`);

    const dbBook = convertToDbBook(bookToProcess);
    console.log('Converting to DB format with content warnings:', dbBook.contentWarnings);

    // Create or update the book
    await this.prisma.book.upsert({
      where: { id: bookToProcess.id },
      update: dbBook,
      create: dbBook,
    });

    // Create new stats entry for today
    await this.prisma.bookStats.create({
      data: {
        bookId: bookToProcess.id,
        createdAt: today,
        rating: bookToProcess.rating || 0,
        followers: bookToProcess.stats?.followers || 0,
        views: bookToProcess.stats?.views?.total || 0,
        average_views: bookToProcess.stats?.views?.average || 0,
        favorites: bookToProcess.stats?.favorites || 0,
        ratings_count: bookToProcess.stats?.ratings_count || 0,
        pages: bookToProcess.stats?.pages || 0,
        overall_score: bookToProcess.stats?.overall_score || 0,
        style_score: bookToProcess.stats?.style_score || 0,
        story_score: bookToProcess.stats?.story_score || 0,
        grammar_score: bookToProcess.stats?.grammar_score || 0,
        character_score: bookToProcess.stats?.character_score || 0
      },
    });

    console.log(
      `Successfully processed book: ${bookToProcess.title} (Rating: ${bookToProcess.rating})`
    );
  }

  private async updateExistingStats(book: any, today: Date): Promise<void> {
    // Update existing stats for today
    await this.prisma.bookStats.updateMany({
      where: {
        bookId: book.id,
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      data: {
        rating: book.rating || 0,
        followers: book.stats?.followers || 0,
        views: book.stats?.views?.total || 0,
        average_views: book.stats?.views?.average || 0,
        favorites: book.stats?.favorites || 0,
        ratings_count: book.stats?.ratings_count || 0,
        pages: book.stats?.pages || 0,
        overall_score: book.stats?.overall_score || 0,
        style_score: book.stats?.style_score || 0,
        story_score: book.stats?.story_score || 0,
        grammar_score: book.stats?.grammar_score || 0,
        character_score: book.stats?.character_score || 0
      },
    });
  }
} 