import React from 'react';
import type { Book } from '../types/book';

interface BookCardProps {
  book: Book;
  onAuthorClick?: (authorName: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAuthorClick }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <div className="relative pb-[150%] bg-[#1a1a1a]">
        <img
          src={book.coverUrl || '/placeholder-cover.jpg'}
          alt={`Cover for ${book.title}`}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      <div className="p-4">
        <h3 className="text-copper text-xl font-serif mb-2">{book.title}</h3>
        <button
          onClick={() => onAuthorClick?.(book.author.name)}
          className="text-light-gray hover:text-copper transition-colors duration-200 mb-2 block"
        >
          by {book.author.name}
        </button>
        <div className="flex items-center mb-2 text-light-gray">
          <span className="text-copper">★</span>
          <span className="ml-1">{book.rating.toFixed(1)}</span>
          <span className="mx-2 text-medium-gray">•</span>
          <span>{book.stats?.pages || 0} pages</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate text-light-gray text-sm rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-medium-gray text-sm line-clamp-3">{book.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-medium-gray">
          <span>{(book.stats?.followers || 0).toLocaleString()} followers</span>
          <span>{(book.stats?.views?.total || 0).toLocaleString()} views</span>
        </div>
      </div>
    </div>
  );
}; 