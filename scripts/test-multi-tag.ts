import { searchBooks, setPrismaInstance } from '../lib/royalroad'
import { PrismaClient } from '@prisma/client'

async function testMultiTagFiltering() {
  try {
    // Initialize Prisma
    const prisma = new PrismaClient()
    setPrismaInstance(prisma)

    console.log('Testing multi-tag filtering...\n')

    // Test with both litrpg and gamelit
    console.log('Searching for books with both "litrpg" AND "gamelit" tags...')
    const results = await searchBooks({
      tags: ['litrpg', 'gamelit'],
      limit: 2000,
    })

    console.log(`Found ${results.length} books with both tags:\n`)

    results.forEach((book, idx) => {
      console.log(`${idx + 1}. ${book.title}`)
      console.log(`   Tags: ${book.tags.join(', ')}`)
      console.log(
        `   Has LitRPG: ${book.tags.some(tag => tag.toLowerCase().includes('litrpg'))}`
      )
      console.log(
        `   Has GameLit: ${book.tags.some(tag => tag.toLowerCase().includes('gamelit'))}`
      )
      console.log('')
    })

    if (results.length === 0) {
      console.log(
        '❌ No results found - this suggests the filtering is still not working correctly'
      )
    } else {
      console.log(
        `✅ Found ${results.length} books - filtering appears to be working!`
      )
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error testing multi-tag filtering:', error)
  }
}

testMultiTagFiltering()
