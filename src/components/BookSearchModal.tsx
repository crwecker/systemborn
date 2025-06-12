import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { searchBooks, assignBookToTier, fetchUserBookTiers } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { Book, TierLevel, BookTier } from '../types/book';
import { TIER_CONFIG } from '../types/book';

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: TierLevel;
}

export const BookSearchModal: React.FC<BookSearchModalProps> = ({ isOpen, onClose, targetTier }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get user's current tiers to filter out already added books
  const { data: userTiers = [] } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => user ? fetchUserBookTiers(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Search for books
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['bookSearch', debouncedQuery],
    queryFn: () => searchBooks({ query: debouncedQuery, limit: 20 }),
    enabled: debouncedQuery.length > 2,
  });

  // Add book to tier mutation
  const addBookMutation = useMutation({
    mutationFn: ({ bookId, tier }: { bookId: string; tier: TierLevel }) => 
      assignBookToTier(bookId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] });
      setSearchQuery('');
      onClose();
    }
  });

  const handleAddBook = (book: Book) => {
    if (!user) return;

    // Check if book is already in user's tiers
    const existingTier = userTiers.find(tier => tier.bookId === book.id);
    if (existingTier) {
      alert(`This book is already in your ${TIER_CONFIG[existingTier.tier].name}!`);
      return;
    }

    // Check tier limits
    const tierConfig = TIER_CONFIG[targetTier];
    const currentBooksInTier = userTiers.filter(tier => tier.tier === targetTier).length;
    
    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(`${tierConfig.name} is full! Maximum ${tierConfig.maxBooks} books allowed.`);
      return;
    }

    addBookMutation.mutate({ bookId: book.id, tier: targetTier });
  };

  const handleClose = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    onClose();
  };

  // Filter out books already in user's tiers
  const filteredResults = searchResults.filter(book => 
    !userTiers.some(tier => tier.bookId === book.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Book to Tier</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">Adding to:</span>
              <div className={`px-2 py-1 rounded text-white text-xs font-bold ${TIER_CONFIG[targetTier].color}`}>
                {TIER_CONFIG[targetTier].name}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books by title, author, or description..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Type at least 3 characters to search. Books already in your tiers are filtered out.
          </p>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
          {debouncedQuery.length < 3 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Start typing to search for books</p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>No books found matching "{debouncedQuery}"</p>
              <p className="text-sm mt-1">Try different search terms or check if the books are already in your tiers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((book) => (
                <div
                  key={book.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <img
                    src={book.coverUrl || '/placeholder-cover.jpg'}
                    alt={`Cover for ${book.title}`}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">by {book.author.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>★ {book.rating.toFixed(1)}</span>
                      <span>{book.stats?.pages || 0} pages</span>
                      <span>{(book.stats?.followers || 0).toLocaleString()} followers</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {book.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{book.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBook(book)}
                    disabled={addBookMutation.isPending}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {addBookMutation.isPending ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 