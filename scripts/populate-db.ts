import { prisma } from "../lib/prisma";
import { fetchBooks, convertToDbBook } from "../lib/royalroad";

async function populateDatabase() {
  try {
    console.log("Starting database population...");

    const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // Fetch first 5 pages of books
    for (let page = 1; page <= 5; page++) {
      console.log(`Fetching page ${page}...`);
      const { books } = await fetchBooks(page);

      console.log(`Processing ${books.length} books from page ${page}`);

      // Process each book
      for (const book of books) {
        console.log(
          `Processing book: ${book.title} by ${book.author.name} (Rating: ${book.rating})`,
        );

        try {
          const dbBook = convertToDbBook(book);
          console.log('Converting to DB format with content warnings:', dbBook.contentWarnings);

          // Create or update the book
          await prisma.book.upsert({
            where: { id: book.id },
            update: dbBook,
            create: dbBook,
          });

          // Create new stats entry for today
          await prisma.bookStats.create({
            data: {
              bookId: book.id,
              createdAt: today,
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

          console.log(
            `Successfully processed book: ${book.title} (Rating: ${book.rating})`
          );
        } catch (error) {
          if (error.code === "P2002") {
            // Unique constraint violation - stats already exist for today
            console.log(
              `Stats already exist for ${book.title} today, updating instead...`
            );

            // Update existing stats for today
            await prisma.bookStats.updateMany({
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
          } else {
            console.error(`Error processing book ${book.title}:`, error);
          }
        }
      }

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Database population completed!");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateDatabase();
