import { prisma } from '../lib/prisma'
import { getCachedBooksWithFallback, getCachedTagsWithFallback } from '../lib/cache-manager'

async function testCache() {
  console.log('Testing cache system...\n')

  try {
    // Test 1: Get books with fallback
    console.log('1. Testing book retrieval with fallback...')
    const books = await getCachedBooksWithFallback()
    console.log(`✅ Retrieved ${books.length} books successfully`)
    
    if (books.length > 0) {
      const firstBook = books[0]
      console.log(`   Sample book: "${firstBook.title}" by ${firstBook.author.name}`)
      console.log(`   Followers: ${firstBook.stats?.followers || 0}`)
    }

    // Test 2: Get tags with fallback
    console.log('\n2. Testing tags retrieval with fallback...')
    const { popularTags, allTags } = await getCachedTagsWithFallback()
    console.log(`✅ Retrieved ${popularTags.length} popular tags and ${allTags.length} total tags`)
    console.log(`   Popular tags: ${popularTags.slice(0, 5).join(', ')}...`)

    console.log('\nCache system test completed successfully!')
    console.log('\nNote: If Redis is not configured, the system gracefully falls back to database queries.')

  } catch (error) {
    console.error('❌ Cache test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testCache() 