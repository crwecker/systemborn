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