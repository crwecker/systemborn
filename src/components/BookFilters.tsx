import { FilterButtons } from './FilterButtons'

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'rating', label: 'Rating' },
  { value: 'followers', label: 'Followers' },
  { value: 'views', label: 'Views' },
  { value: 'pages', label: 'Pages' },
  { value: 'latest', label: 'Latest' },
]

const RATING_OPTIONS = [
  { value: 0, label: 'Any Rating' },
  { value: 3, label: '3+ ★' },
  { value: 3.5, label: '3.5+ ★' },
  { value: 4, label: '4+ ★' },
  { value: 4.5, label: '4.5+ ★' },
  { value: 5, label: '5 ★' },
]

const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'All Sources', color: 'bg-copper' },
  { value: 'ROYAL_ROAD', label: 'Royal Road', color: 'bg-blue-600' },
  { value: 'AMAZON', label: 'Amazon', color: 'bg-orange-600' },
] as const

export type SourceFilter = typeof SOURCE_OPTIONS[number]['value']

export interface BookFilters {
  selectedTags: string[]
  sortBy: string
  minRating: number
  searchQuery: string
  sourceFilter: SourceFilter
}

interface BookFiltersProps {
  filters: BookFilters
  onFiltersChange: (updates: Partial<BookFilters>) => void
  popularTags: string[]
  debouncedSearchQuery: string
}

export const BookFiltersComponent = ({ filters, onFiltersChange, popularTags, debouncedSearchQuery }: BookFiltersProps) => {
  const handleTagClick = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag]
    onFiltersChange({ selectedTags: newTags })
  }

  return (
    <div className='mb-8 bg-slate p-6 rounded-lg shadow'>
      {/* Search Input */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-light-gray mb-2'>Search Books</label>
        <div className='relative'>
          <input
            type='text'
            value={filters.searchQuery}
            onChange={e => onFiltersChange({ searchQuery: e.target.value })}
            placeholder='Search by title, author, or description...'
            className='w-full p-3 pr-10 rounded bg-medium-gray text-light-gray border-slate border focus:border-copper focus:ring-1 focus:ring-copper placeholder-gray-400'
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFiltersChange({ searchQuery: '' })}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-light-gray'>
              ✕
            </button>
          )}
        </div>
        {debouncedSearchQuery && (
          <div className='mt-2 text-sm text-copper'>
            Searching for: "{debouncedSearchQuery}"
          </div>
        )}
      </div>

      {/* Source Filter */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-light-gray mb-2'>Source</label>
        <FilterButtons
          options={SOURCE_OPTIONS}
          currentValue={filters.sourceFilter}
          onChange={(value) => onFiltersChange({ sourceFilter: value })}
          className='gap-2'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Tags */}
        <div>
          <label className='block text-sm font-medium text-light-gray mb-2'>Tags</label>
          <div className='flex flex-wrap gap-2'>
            {popularTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  filters.selectedTags.includes(tag)
                    ? 'bg-copper text-dark-blue'
                    : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className='block text-sm font-medium text-light-gray mb-2'>Minimum Rating</label>
          <FilterButtons
            options={RATING_OPTIONS}
            currentValue={filters.minRating}
            onChange={(value) => onFiltersChange({ minRating: value })}
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className='block text-sm font-medium text-light-gray mb-2'>Sort By</label>
          <FilterButtons
            options={SORT_OPTIONS}
            currentValue={filters.sortBy}
            onChange={(value) => onFiltersChange({ sortBy: value })}
          />
        </div>
      </div>
    </div>
  )
} 