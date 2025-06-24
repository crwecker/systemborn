import { createRoute } from '@tanstack/react-router'
import { BooksPage } from '../pages/Books'
import { Route as rootRoute } from './__root'
import type { SourceFilter } from '../components/BookFilters'

// Define search params schema
type BooksSearch = {
  tags?: string[]
  sortBy?: string
  query?: string
  minRating?: number
  sourceFilter?: string
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/books',
  validateSearch: (search: Record<string, unknown>): BooksSearch => {
    return {
      tags: Array.isArray(search.tags)
        ? (search.tags as string[])
        : typeof search.tags === 'string'
          ? [search.tags]
          : undefined,
      sortBy: typeof search.sortBy === 'string' ? search.sortBy : undefined,
      query: typeof search.query === 'string' ? search.query : undefined,
      minRating:
        typeof search.minRating === 'number' ? search.minRating : undefined,
      sourceFilter:
        typeof search.sourceFilter === 'string'
          ? search.sourceFilter
          : undefined,
    }
  },
  component: Books,
})

function Books() {
  const { tags, sortBy, query, minRating, sourceFilter } = Route.useSearch()

  return (
    <main className='container mx-auto py-6'>
      <BooksPage
        initialFilters={{
          selectedTags: tags || [],
          sortBy: sortBy || 'followers',
          searchQuery: query || '',
          minRating: minRating || 0,
          sourceFilter: (sourceFilter as SourceFilter) || 'ALL',
        }}
      />
    </main>
  )
}
