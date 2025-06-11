import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserBookTiers, removeBookFromTiers } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { BookTier, TierLevel, TierData } from '../types/book';
import { TIER_CONFIG } from '../types/book';
import { BookCard } from './BookCard';

const TierList: React.FC = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: bookTiers = [], isLoading } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => user ? fetchUserBookTiers(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const removeTierMutation = useMutation({
    mutationFn: (tierId: string) => removeBookFromTiers(tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] });
    }
  });

  // Organize books by tier
  const tierData: TierData[] = Object.entries(TIER_CONFIG).map(([tierLevel, config]) => ({
    tier: tierLevel as TierLevel,
    books: bookTiers.filter(bt => bt.tier === tierLevel),
    maxBooks: config.maxBooks
  }));

  const handleRemoveFromTier = (tierId: string) => {
    if (window.confirm('Remove this book from your tier list?')) {
      removeTierMutation.mutate(tierId);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to manage your book tiers.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your book tiers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Book Tier List</h1>
        <p className="text-gray-600">
          Your books organized into tiers based on your preferences.
        </p>
      </div>

      <div className="space-y-6">
        {tierData.map(({ tier, books, maxBooks }) => {
          const config = TIER_CONFIG[tier];
          
          return (
            <div key={tier} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-lg text-white font-bold ${config.color}`}>
                    {config.name}
                  </div>
                  <span className="text-sm text-gray-500">
                    {books.length} book{books.length !== 1 ? 's' : ''}
                    {maxBooks && ` / ${maxBooks} max`}
                  </span>
                </div>
              </div>

              <div className="min-h-[200px] p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
                {books.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>No books in {config.name} yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {books.map((bookTier) => (
                      <div key={bookTier.id} className="relative">
                        {bookTier.book && (
                          <div className="relative">
                            <BookCard book={bookTier.book} />
                            <button
                              onClick={() => handleRemoveFromTier(bookTier.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                              title="Remove from tier"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About your tier list:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>SSS Tier:</strong> Your current absolute favorite book (1 book max)</li>
          <li>• <strong>SS Tier:</strong> Your top-tier favorites (3 books max)</li>
          <li>• <strong>S Tier:</strong> Excellent books you highly recommend (5 books max)</li>
          <li>• <strong>A-F Tiers:</strong> Organize the rest of your books as you see fit (unlimited)</li>
          <li>• Add books to tiers from individual book pages</li>
          <li>• Click the × button to remove books from your tier list</li>
        </ul>
      </div>
    </div>
  );
};

export default TierList; 