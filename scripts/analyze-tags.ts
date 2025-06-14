import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeTagFrequency() {
  try {
    console.log('Analyzing tag frequency in the database...\n')

    // Get all books with their tags
    const books = await prisma.book.findMany({
      select: { tags: true }
    })

    console.log(`Total books in database: ${books.length}`)

    // Count tag frequency
    const tagFrequency: Record<string, number> = {}
    
    books.forEach(book => {
      book.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      })
    })

    // Sort tags by frequency (most popular first)
    const sortedTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)

    console.log('\nTop 20 most popular tags:')
    console.log('=' .repeat(50))
    
    sortedTags.slice(0, 20).forEach(([tag, count], index) => {
      const percentage = ((count / books.length) * 100).toFixed(1)
      console.log(`${(index + 1).toString().padStart(2)}. ${tag.padEnd(25)} ${count.toString().padStart(4)} books (${percentage}%)`)
    })

    // Look for LitRPG-related tags specifically
    const litrpgRelatedTags = sortedTags.filter(([tag]) => {
      const tagLower = tag.toLowerCase()
      return (
        tagLower.includes('litrpg') ||
        tagLower.includes('gamelit') ||
        tagLower.includes('progression') ||
        tagLower.includes('portal') ||
        tagLower.includes('isekai') ||
        tagLower.includes('dungeon') ||
        tagLower.includes('system') ||
        tagLower.includes('cultivation') ||
        tagLower.includes('xianxia') ||
        tagLower.includes('apocalypse') ||
        tagLower.includes('virtual') ||
        tagLower.includes('reincarnation') ||
        tagLower.includes('time')
      )
    })

    console.log('\nLitRPG-related tags found:')
    console.log('=' .repeat(50))
    
    litrpgRelatedTags.slice(0, 15).forEach(([tag, count], index) => {
      const percentage = ((count / books.length) * 100).toFixed(1)
      console.log(`${(index + 1).toString().padStart(2)}. ${tag.padEnd(25)} ${count.toString().padStart(4)} books (${percentage}%)`)
    })

    // Suggest top 9 LitRPG-related tags
    console.log('\nSuggested top 9 LitRPG-related tags for filter:')
    console.log('=' .repeat(50))
    
    const top9 = litrpgRelatedTags.slice(0, 9)
    top9.forEach(([tag, count], index) => {
      console.log(`${index + 1}. "${tag.toLowerCase()}"`)
    })

    console.log('\nArray format for code:')
    const arrayFormat = top9.map(([tag]) => `"${tag.toLowerCase()}"`).join(',\n  ')
    console.log(`[\n  ${arrayFormat}\n]`)

  } catch (error) {
    console.error('Error analyzing tags:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeTagFrequency() 