import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupLowFollowerBooks() {
  console.log('Starting cleanup of books with less than 100 followers...')
  
  try {
    // First, let's see how many books we have and their follower distribution
    const totalBooks = await prisma.book.count()
    console.log(`Total books in database: ${totalBooks}`)
    
    // Find books with less than 100 followers
    // We need to get the latest stats for each book
    const booksToDelete = await prisma.book.findMany({
      where: {
        stats: {
          some: {
            followers: {
              lt: 100
            }
          }
        }
      },
      include: {
        stats: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })
    
    // Filter to only include books where the latest stats show < 100 followers
    const booksWithLowFollowers = booksToDelete.filter(book => 
      book.stats.length > 0 && book.stats[0].followers < 100
    )
    
    console.log(`Found ${booksWithLowFollowers.length} books with less than 100 followers`)
    
    if (booksWithLowFollowers.length === 0) {
      console.log('No books to delete. Cleanup complete.')
      return
    }
    
    const bookIdsToDelete = booksWithLowFollowers.map(book => book.id)
    
    // Delete in the correct order to handle foreign key constraints
    console.log('Deleting BookReviews...')
    const deletedReviews = await prisma.bookReview.deleteMany({
      where: {
        bookId: {
          in: bookIdsToDelete
        }
      }
    })
    console.log(`Deleted ${deletedReviews.count} book reviews`)
    
    console.log('Deleting BookTiers...')
    const deletedTiers = await prisma.bookTier.deleteMany({
      where: {
        bookId: {
          in: bookIdsToDelete
        }
      }
    })
    console.log(`Deleted ${deletedTiers.count} book tiers`)
    
    console.log('Deleting BookStats...')
    const deletedStats = await prisma.bookStats.deleteMany({
      where: {
        bookId: {
          in: bookIdsToDelete
        }
      }
    })
    console.log(`Deleted ${deletedStats.count} book stats records`)
    
    console.log('Deleting Books...')
    const deletedBooks = await prisma.book.deleteMany({
      where: {
        id: {
          in: bookIdsToDelete
        }
      }
    })
    console.log(`Deleted ${deletedBooks.count} books`)
    
    const remainingBooks = await prisma.book.count()
    console.log(`Remaining books in database: ${remainingBooks}`)
    console.log(`Successfully removed ${totalBooks - remainingBooks} books with low followers`)
    
  } catch (error) {
    console.error('Cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupLowFollowerBooks()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 