export interface Book {
  id: string;
  title: string;
  author: {
    name: string;
  };
  description: string;
  tags: string[];
  image: string;
  url: string;
  rating: number;
  coverUrl: string;
  contentWarnings: string[];
  stats: {
    followers: number;
    views: {
      total: number;
      average: number;
    };
    pages: number;
    favorites: number;
    ratings_count: number;
    overall_score: number;
    style_score: number;
    story_score: number;
    grammar_score: number;
    character_score: number;
  };
}

export type TierLevel = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'READ' | 'D' | 'E' | 'F';

export interface BookTier {
  id: string;
  userId: string;
  bookId: string;
  tier: TierLevel;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface BookReview {
  id: string;
  userId: string;
  bookId: string;
  review: string;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface TierData {
  tier: TierLevel;
  books: BookTier[];
  maxBooks?: number;
}

export const TIER_CONFIG: Record<TierLevel, { name: string; maxBooks?: number; color: string }> = {
  SSS: { name: 'SSS (Current Favorite)', maxBooks: 1, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  SS: { name: 'SS Tier', maxBooks: 3, color: 'bg-gradient-to-r from-red-400 to-pink-500' },
  S: { name: 'S Tier', maxBooks: 5, color: 'bg-gradient-to-r from-purple-400 to-blue-500' },
  A: { name: 'A Tier', color: 'bg-gradient-to-r from-green-400 to-teal-500' },
  B: { name: 'B Tier', color: 'bg-gradient-to-r from-blue-400 to-indigo-500' },
  C: { name: 'C Tier', color: 'bg-gradient-to-r from-indigo-400 to-purple-500' },
  READ: { name: 'Read (Unranked)', color: 'bg-gradient-to-r from-blue-300 to-cyan-400' },
  D: { name: 'D Tier', color: 'bg-gradient-to-r from-gray-400 to-gray-500' },
  E: { name: 'E Tier', color: 'bg-gradient-to-r from-gray-500 to-gray-600' },
  F: { name: 'F Tier', color: 'bg-gradient-to-r from-gray-600 to-gray-700' },
}; 