import React from 'react';
import type { Book } from '../types/book';

interface BookCardProps {
  book: Book;
  onAuthorClick?: (authorName: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAuthorClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative pb-[56.25%]">
        <img
          src={book.coverUrl || '/placeholder-cover.jpg'}
          alt={`Cover for ${book.title}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
        <button
          onClick={() => onAuthorClick?.(book.author.name)}
          className="text-blue-600 hover:underline mb-2 block"
        >
          by {book.author.name}
        </button>
        <div className="flex items-center mb-2">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{book.rating.toFixed(1)}</span>
          <span className="mx-2">•</span>
          <span>{book.stats?.pages || 0} pages</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-600 text-sm line-clamp-3">{book.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>{(book.stats?.followers || 0).toLocaleString()} followers</span>
          <span>{(book.stats?.views?.total || 0).toLocaleString()} views</span>
        </div>
      </div>
    </div>
  );
}; 