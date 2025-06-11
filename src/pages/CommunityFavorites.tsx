import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { BookTier, TierLevel } from '../types/book';
import { TIER_CONFIG } from '../types/book';
import { SimplifiedBookCard } from '../components/SimplifiedBookCard';

// API function to fetch community favorites
async function fetchCommunityFavorites(): Promise<{[userId: string]: {user: {name: string, id: string}, tiers: BookTier[]}}> {
  const USER_API_BASE_URL = import.meta.env.PROD 
    ? '/.netlify/functions/user-api'
    : 'http://localhost:3000/.netlify/functions/user-api';

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${USER_API_BASE_URL}/community-favorites`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch community favorites');
  }

  return response.json();
}

const CommunityFavorites: React.FC = () => {
  const { user } = useAuthContext();

  const { data: communityData = {}, isLoading, error } = useQuery({
    queryKey: ['communityFavorites'],
    queryFn: fetchCommunityFavorites,
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to see community favorites.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading community favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading community favorites: {error.message}</p>
      </div>
    );
  }

  const users = Object.values(communityData);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Favorites</h1>
        <p className="text-gray-600">
          Discover what books the community loves most - their SSS, SS, and S tier picks.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No community favorites available yet.</p>
          <p className="text-sm text-gray-400 mt-2">Be the first to add books to your tier list!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {users.map((userData) => {
            const premiumTiers = userData.tiers.filter(t => ['SSS', 'SS', 'S'].includes(t.tier));
            
            if (premiumTiers.length === 0) return null;

            // Organize by tier
            const tierGroups: Record<'SSS' | 'SS' | 'S', BookTier[]> = {
              SSS: premiumTiers.filter(t => t.tier === 'SSS'),
              SS: premiumTiers.filter(t => t.tier === 'SS'),
              S: premiumTiers.filter(t => t.tier === 'S')
            };

            return (
              <div key={userData.user.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{userData.user.name}'s Favorites</h2>
                </div>

                <div className="space-y-4">
                  {(['SSS', 'SS', 'S'] as const).map(tier => {
                    const books = tierGroups[tier];
                    if (books.length === 0) return null;

                    const config = TIER_CONFIG[tier];
                    
                    return (
                      <div key={tier}>
                        <div className="flex items-center mb-3">
                          <div className={`px-3 py-1 rounded text-white font-bold text-sm ${config.color} mr-3`}>
                            {config.name}
                          </div>
                          <span className="text-sm text-gray-500">
                            {books.length} book{books.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                          {books.map((bookTier: BookTier) => (
                            <div key={bookTier.id}>
                              {bookTier.book && (
                                <SimplifiedBookCard book={bookTier.book} tier={bookTier.tier} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityFavorites; 