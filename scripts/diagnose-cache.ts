import { redis, CACHE_KEYS, shouldRefreshCache, getCachedBooks, getCachedAmazonBooks, getCachedPopularTags, getCachedAllTags } from '../lib/redis'
import { refreshCache } from '../lib/cache-manager'

async function diagnoseCache() {
  console.log('🔍 Redis Cache Diagnostics\n')

  // Test 1: Check Redis connection
  console.log('1. Testing Redis Connection...')
  try {
    if (!redis) {
      console.log('❌ Redis client not initialized')
      console.log('   Check your UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
      return
    }

    // Test basic Redis operation
    const testKey = 'test:connection'
    await redis.set(testKey, 'test-value', { ex: 10 })
    const testValue = await redis.get(testKey)
    
    if (testValue === 'test-value') {
      console.log('✅ Redis connection working!')
      await redis.del(testKey) // Clean up
    } else {
      console.log('❌ Redis connection failed - test value mismatch')
      return
    }
  } catch (error) {
    console.log('❌ Redis connection error:', error)
    return
  }

  // Test 2: Check cache keys existence
  console.log('\n2. Checking Cache Keys...')
  try {
    const keys = await Promise.all([
      redis.exists(CACHE_KEYS.ALL_BOOKS),
      redis.exists(CACHE_KEYS.AMAZON_BOOKS),
      redis.exists(CACHE_KEYS.POPULAR_TAGS),
      redis.exists(CACHE_KEYS.ALL_TAGS),
      redis.exists(CACHE_KEYS.LAST_UPDATE)
    ])

    const keyNames = ['ALL_BOOKS', 'AMAZON_BOOKS', 'POPULAR_TAGS', 'ALL_TAGS', 'LAST_UPDATE']
    keyNames.forEach((name, index) => {
      const exists = keys[index] === 1
      console.log(`   ${exists ? '✅' : '❌'} ${name}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })

    const allKeysExist = keys.every(k => k === 1)
    if (!allKeysExist) {
      console.log('\n   Some cache keys are missing. Running cache refresh...')
      await refreshCache()
      console.log('   ✅ Cache refresh completed')
    }
  } catch (error) {
    console.log('❌ Error checking cache keys:', error)
  }

  // Test 3: Check cache sizes and content
  console.log('\n3. Checking Cache Content...')
  try {
    const [books, amazonBooks, popularTags, allTags] = await Promise.all([
      getCachedBooks(),
      getCachedAmazonBooks(),
      getCachedPopularTags(),
      getCachedAllTags()
    ])

    console.log(`   📚 Royal Road Books: ${books?.length || 0} books`)
    console.log(`   🛒 Amazon Books: ${amazonBooks?.length || 0} books`)
    console.log(`   🏷️  Popular Tags: ${popularTags?.length || 0} tags`)
    console.log(`   📋 All Tags: ${allTags?.length || 0} tags`)

    if (books && books.length > 0) {
      const topBooks = books
        .sort((a, b) => (b.stats?.followers || 0) - (a.stats?.followers || 0))
        .slice(0, 3)
      
      console.log('\n   📊 Top books by followers:')
      topBooks.forEach((book, i) => {
        console.log(`      ${i + 1}. "${book.title}" - ${book.stats?.followers || 0} followers`)
      })
    }
  } catch (error) {
    console.log('❌ Error checking cache content:', error)
  }

  // Test 4: Check cache freshness
  console.log('\n4. Checking Cache Freshness...')
  try {
    const needsRefresh = await shouldRefreshCache()
    const lastUpdate = await redis.get(CACHE_KEYS.LAST_UPDATE)
    
    if (lastUpdate) {
      const lastUpdateTime = new Date(parseInt(lastUpdate as string))
      const age = (Date.now() - lastUpdateTime.getTime()) / 1000 / 60 // minutes
      console.log(`   🕐 Cache age: ${age.toFixed(1)} minutes`)
      console.log(`   ${needsRefresh ? '🔄' : '✅'} Needs refresh: ${needsRefresh}`)
    } else {
      console.log('   ❌ No cache timestamp found')
    }
  } catch (error) {
    console.log('❌ Error checking cache freshness:', error)
  }

  // Test 5: Performance test
  console.log('\n5. Performance Test...')
  try {
    console.log('   Testing cache retrieval speed...')
    
    const start = Date.now()
    const books = await getCachedBooks()
    const duration = Date.now() - start
    
    console.log(`   ⚡ Retrieved ${books?.length || 0} books in ${duration}ms`)
    
    if (duration < 100) {
      console.log('   ✅ Cache performance: EXCELLENT (< 100ms)')
    } else if (duration < 500) {
      console.log('   ⚠️  Cache performance: GOOD (< 500ms)')
    } else {
      console.log('   ❌ Cache performance: SLOW (> 500ms) - May indicate cache miss')
    }
  } catch (error) {
    console.log('❌ Error in performance test:', error)
  }

  // Test 6: TTL Check
  console.log('\n6. Checking TTL (Time To Live)...')
  try {
    const ttls = await Promise.all([
      redis.ttl(CACHE_KEYS.ALL_BOOKS),
      redis.ttl(CACHE_KEYS.AMAZON_BOOKS),
      redis.ttl(CACHE_KEYS.POPULAR_TAGS),
      redis.ttl(CACHE_KEYS.ALL_TAGS)
    ])

    const keyNames = ['ALL_BOOKS', 'AMAZON_BOOKS', 'POPULAR_TAGS', 'ALL_TAGS']
    keyNames.forEach((name, index) => {
      const ttl = ttls[index]
      if (ttl === -1) {
        console.log(`   ⚠️  ${name}: No expiration set`)
      } else if (ttl === -2) {
        console.log(`   ❌ ${name}: Key doesn't exist`)
      } else {
        const minutes = Math.floor(ttl / 60)
        console.log(`   ✅ ${name}: Expires in ${minutes} minutes`)
      }
    })
  } catch (error) {
    console.log('❌ Error checking TTL:', error)
  }

  console.log('\n🎉 Cache diagnostics completed!')
}

diagnoseCache().catch(console.error) 