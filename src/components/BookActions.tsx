import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignBookToTier, createBookReview, fetchUserBookTiers, fetchUserBookReviews } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { TierLevel } from '../types/book';
import { TIER_CONFIG } from '../types/book';

interface BookActionsProps {
  bookId: string;
  bookTitle: string;
}

const BookActions: React.FC<BookActionsProps> = ({ bookId, bookTitle }) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<TierLevel>('A');
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: userTiers = [] } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => user ? fetchUserBookTiers(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: userReviews = [] } = useQuery({
    queryKey: ['userBookReviews', user?.id],
    queryFn: () => user ? fetchUserBookReviews(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const assignTierMutation = useMutation({
    mutationFn: ({ bookId, tier }: { bookId: string; tier: TierLevel }) => 
      assignBookToTier(bookId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] });
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ bookId, review }: { bookId: string; review: string }) => 
      createBookReview(bookId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookReviews'] });
      setReviewText('');
      setShowReviewForm(false);
    }
  });

  // Check if book is already in user's tiers
  const existingTier = userTiers.find(tier => tier.bookId === bookId);
  
  // Check if user has already reviewed this book
  const existingReview = userReviews.find(review => review.bookId === bookId);

  const handleAddToTier = () => {
    if (!user) return;
    
    // Check tier limits
    const tierConfig = TIER_CONFIG[selectedTier];
    const currentBooksInTier = userTiers.filter(tier => tier.tier === selectedTier).length;
    
    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(`Tier ${selectedTier} is full! Maximum ${tierConfig.maxBooks} books allowed.`);
      return;
    }

    assignTierMutation.mutate({ bookId, tier: selectedTier });
  };

  const handleSubmitReview = () => {
    if (!user || !reviewText.trim()) return;
    
    createReviewMutation.mutate({ bookId, review: reviewText.trim() });
  };

  const handleMarkAsRead = () => {
    if (!user) return;
    assignTierMutation.mutate({ bookId, tier: 'READ' });
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-center">
          <a href="/signin" className="font-medium hover:underline">Sign in</a> to add this book to your tier list or write a review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {!existingTier && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <button
            onClick={handleMarkAsRead}
            disabled={assignTierMutation.isPending}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assignTierMutation.isPending ? 'Adding...' : 'Mark as Read'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Add this book to your read collection, then organize it into tiers later from your Tier List page.
          </p>
        </div>
      )}

      {/* Tier Selection */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add to Tier List</h3>
        
        {existingTier ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Already in tier:</span>
            <div className={`px-3 py-1 rounded-lg text-white font-bold text-sm ${TIER_CONFIG[existingTier.tier].color}`}>
              {TIER_CONFIG[existingTier.tier].name}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="tier-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Tier
              </label>
              <select
                id="tier-select"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as TierLevel)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                                 {Object.entries(TIER_CONFIG).map(([tier, config]) => {
                   const currentCount = userTiers.filter(t => t.tier === tier).length;
                   const isDisabled = config.maxBooks ? currentCount >= config.maxBooks : false;
                   
                   return (
                     <option key={tier} value={tier} disabled={isDisabled}>
                       {config.name} {config.maxBooks ? `(${currentCount}/${config.maxBooks})` : ''}
                     </option>
                   );
                 })}
              </select>
            </div>
            
            <button
              onClick={handleAddToTier}
              disabled={assignTierMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignTierMutation.isPending ? 'Adding...' : `Add to ${TIER_CONFIG[selectedTier].name}`}
            </button>
          </div>
        )}
      </div>

      {/* Review Section */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review</h3>
        
        {existingReview ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">You've already reviewed this book</span>
              <a 
                href="/my-reviews" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Review
              </a>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-800 text-sm line-clamp-3">{existingReview.review}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Write a Review
              </button>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={`Share your thoughts about "${bookTitle}"...`}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={6}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim() || createReviewMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createReviewMutation.isPending ? 'Posting...' : 'Post Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewText('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookActions; 