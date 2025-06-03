export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  rating: number;
  coverUrl: string;
  url: string;
  stats?: {
    followers: number;
    pages: number;
    views: {
      total: number;
      average: number;
    };
    score: {
      total: number;
      average: number;
    };
  };
} 