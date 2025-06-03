import { data } from "react-router";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Book } from "~/types/book";
import { getPopularBooks } from "~/services/royalroad.server";

interface LoaderData {
  books: Book[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const books = await getPopularBooks();
    return data<LoaderData>({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return data<LoaderData>({ books: [] });
  }
};

export default function Index() {
  const { books } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Discover Your Next LitRPG Adventure
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Explore popular LitRPG, GameLit, and Progression Fantasy stories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <div key={index} className="book-card">
            {book.image && (
              <img
                src={book.image}
                alt={`Cover of ${book.title}`}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {book.title}
            </h2>
            {book.author && (
              <p className="text-gray-600 mb-3">by {book.author.name}</p>
            )}
            <div className="mb-4">
              {book.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
            {book.description && (
              <p className="text-gray-700 line-clamp-3">{book.description}</p>
            )}
            {book.stats && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="mr-3">⭐ {book.stats.score?.average.toFixed(1) || 'N/A'}</span>
                <span className="mr-3">📖 {book.stats.pages || 0} pages</span>
                <span>👥 {book.stats.followers || 0} followers</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
