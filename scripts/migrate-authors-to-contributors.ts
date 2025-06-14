import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAuthorsToContributors() {
  console.log('Starting migration of authors to contributors...')
  
  try {
    // Get all books with their author names
    const books = await prisma.book.findMany({
      select: {
        id: true,
        authorName: true,
      },
      where: {
        authorName: {
          not: ''
        }
      }
    })
    
    console.log(`Found ${books.length} books with authors to migrate`)
    
    // Get unique author names
    const uniqueAuthorNames = [...new Set(books.map(book => book.authorName))]
    console.log(`Found ${uniqueAuthorNames.length} unique authors`)
    
    // Create contributor records for each unique author
    const contributorMap = new Map<string, string>()
    
    for (const authorName of uniqueAuthorNames) {
      // Check if contributor already exists
      let contributor = await prisma.contributor.findFirst({
        where: {
          name: authorName
        }
      })
      
      if (!contributor) {
        contributor = await prisma.contributor.create({
          data: {
            name: authorName
          }
        })
        console.log(`Created contributor: ${authorName}`)
      }
      
      contributorMap.set(authorName, contributor.id)
    }
    
    // Create BookContributor relationships
    let migratedCount = 0
    
    for (const book of books) {
      const contributorId = contributorMap.get(book.authorName)
      
      if (contributorId) {
        // Check if relationship already exists
        const existingRelation = await prisma.bookContributor.findUnique({
          where: {
            bookId_contributorId_contributorType: {
              bookId: book.id,
              contributorId: contributorId,
              contributorType: 'AUTHOR'
            }
          }
        })
        
        if (!existingRelation) {
          await prisma.bookContributor.create({
            data: {
              bookId: book.id,
              contributorId: contributorId,
              contributorType: 'AUTHOR'
            }
          })
          migratedCount++
        }
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} author relationships`)
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateAuthorsToContributors()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 