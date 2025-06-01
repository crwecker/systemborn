export interface Author {
  name: string;
  id?: number;
  title?: string;
  avatar?: string;
}

export interface Book {
  title: string;
  tags: string[];
  description?: string;
  author?: Author;
  status?: string;
  stats?: {
    pages?: number;
    ratings?: number;
    followers?: number;
    favorites?: number;
    views?: {
      total: number;
      average: number;
    };
    score?: {
      total: number;
      average: number;
    };
  };
  image?: string;
  warnings?: string[];
} 