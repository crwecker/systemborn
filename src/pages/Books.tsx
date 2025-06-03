import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookCard } from '../components/BookCard';
import type { Book } from '../types/book';
import { fetchTags, searchBooks, fetchTrendingBooks } from '../services/api';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'followers', label: 'Followers' },
  { value: 'views', label: 'Views' },
  { value: 'pages', label: 'Pages' },
  { value: 'latest', label: 'Latest' },
];

export function BooksPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [minPages, setMinPages] = useState(0);

  // Fetch available tags
  const { data: tags = [] } = useQuery<string[]>({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  // Fetch books with current filters
  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ['books', selectedTags, minRating, minPages, sortBy],
    queryFn: () => searchBooks({
      tags: selectedTags,
      minRating,
      minPages,
      sortBy,
    }),
  });

  const { data: trendingBooks = [] } = useQuery<Book[]>({
    queryKey: ['trending-books'],
    queryFn: () => fetchTrendingBooks(),
  });

  const handleAuthorClick = (authorName: string) => {
    // Navigate to author's page or filter by author
    window.location.href = `/author/${encodeURIComponent(authorName)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trending Books */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-copper">Trending in LitRPG</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingBooks.slice(0, 4).map(book => (
            <BookCard
              key={book.id}
              book={book}
              onAuthorClick={handleAuthorClick}
            />
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="mb-8 bg-slate p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-copper">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray'
                  } transition-colors duration-200`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Minimum Rating
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={e => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-copper"
            />
            <span className="text-sm text-light-gray">{minRating} stars</span>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full p-2 rounded bg-medium-gray text-light-gray border-slate border focus:border-copper focus:ring-1 focus:ring-copper"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-light-gray">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onAuthorClick={handleAuthorClick}
            />
          ))}
        </div>
      )}
    </div>
  );
} 