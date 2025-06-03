import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContentWarnings() {
  try {
    // Find all books that have non-empty content warnings
    const booksWithWarnings = await prisma.book.findMany({
      where: {
        contentWarnings: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        title: true,
        contentWarnings: true
      }
    });

    console.log('Books with content warnings:');
    console.log(JSON.stringify(booksWithWarnings, null, 2));

    // Also check for a specific book that should have warnings
    const sampleBook = await prisma.book.findFirst({
      select: {
        id: true,
        title: true,
        contentWarnings: true
      }
    });

    console.log('\nSample book content warnings:');
    console.log(JSON.stringify(sampleBook, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentWarnings(); 