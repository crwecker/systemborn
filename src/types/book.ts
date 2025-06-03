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
  stats?: {
    followers: number;
    views: {
      total: number;
      average?: number;
    };
    pages: number;
    score?: {
      total: number;
      average: number;
    };
  };
} 