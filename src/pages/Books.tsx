import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookCard } from "../components/BookCard";
import type { Book } from "../types/book";
import { searchBooks, fetchTrendingBooks } from "../services/api";
import { LITRPG_RELATED_TAGS } from "../../lib/royalroad";

// Here are some affiliate links. Let's get these on the website along with the message ""As an Amazon Associate I earn from qualifying purchases."
const AFFILIATE_LINKS = [
  {
    title: `Mother of Learning: ARC 1`,
    affiliate_link: `https://amzn.to/4jvc6gb`,
    poster: `https://m.media-amazon.com/images/I/81NXjG0TyuL._SY522_.jpg`,
    description: `Great story. Listened to it on a road trip and my teenagers loved it. Such a good time loop story. I love how the world unfolds and mysteries are revealed.`,
  },
  {
    title: `Iron Prince (Warformed: Stormweaver Book 1)`,
    affiliate_link: `https://amzn.to/45El8Ep`,
    poster: `https://m.media-amazon.com/images/I/81GLx+EaP2L._SY522_.jpg`,
    description: `My teenager's read this book over and over. More sci-fi than litrpg, but it is such an awesome underdog story.`,
  },
  {
    title: `Ritualist: An Epic Fantasy LitRPG Adventure (The Completionist Chronicles Book 1)`,
    affiliate_link: `https://amzn.to/3FEfs2L`,
    poster: `https://m.media-amazon.com/images/I/51prG6HjRRL._SY445_SX342_PQ35_.jpg`,
    description: `One of the first litrpg books I listened to with my family. It had us laughing out loud. Great characters.`,
  },
  {
    title: `Heretical Fishing: A Cozy Guide to Annoying the Cults, Outsmarting the Fish, and Alienating Oneself`,
    affiliate_link: `https://amzn.to/45DK8vq`,
    poster: `https://m.media-amazon.com/images/I/41qt6S2ttZL._SY445_SX342_PQ35_.jpg`,
    description: `I've read (listened to) this one a few times. It is very cozy. Great characters and really makes you want to go fishing!`,
  },
  {
    title: `Beware of Chicken: A Xianxia Cultivation Novel`,
    affiliate_link: `https://amzn.to/43Afbpi`,
    poster: `https://m.media-amazon.com/images/I/512HZqVOzeL._SY445_SX342_PQ35_.jpg`,
    description: `Also super cozy. I got my 70 year old parents to listen to this one and they loved it.`,
  },
  {
    title: `The Wandering Inn: Book One in The Wandering Inn Series`,
    affiliate_link: `https://amzn.to/4jzfKFZ`,
    poster: `https://m.media-amazon.com/images/I/41zGUBv9XHL._SY445_SX342_PQ35_.jpg`,
    description: `Great story. Very epic. Lots of fun and unique characters. The story is super duper long and still going strong.`,
  },
  {
    title: `Dungeon Crawler Carl: Dungeon Crawler Carl Book 1`,
    affiliate_link: `https://amzn.to/3SA9faY`,
    poster: `https://m.media-amazon.com/images/I/81XbhUrUsBL._SY522_.jpg`,
    description: `It's been a while since I've read this (pretty sure book 4 had just come out). Great characters and so fun as you learn more and more about the world Carl is thrust into.`,
  },
  {
    title: `Unsouled (Cradle Book 1)`,
    affiliate_link: `https://amzn.to/3ZfgFnT`,
    poster: `https://m.media-amazon.com/images/I/513JnJQpruL._SY445_SX342_PQ35_.jpg`,
    description: `Super fun read. Great progression. The unfolding of each new cultivation level opens up the world (and universe) a bit more so it keeps you on your toes. `,
  },
  {
    title: `He Who Fights with Monsters: A LitRPG Adventure`,
    affiliate_link: `https://amzn.to/43q5Bqm`,
    poster: `https://m.media-amazon.com/images/I/51l0a6bIDQL._SY445_SX342_PQ35_.jpg`,
    description: `Classic litrpg. Great world building and great characters.`,
  },
];

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Rating" },
  { value: "followers", label: "Followers" },
  { value: "views", label: "Views" },
  { value: "pages", label: "Pages" },
  { value: "latest", label: "Latest" },
];

export function BooksPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("trending");
  const [minRating, setMinRating] = useState(0);
  const [minPages, setMinPages] = useState(0);

  // Fetch books with current filters
  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["books", selectedTags, minRating, minPages, sortBy],
    queryFn: () =>
      searchBooks({
        tags: selectedTags,
        minRating,
        minPages,
        sortBy,
      }),
  });

  const handleAuthorClick = (authorName: string) => {
    window.location.href = `/author/${encodeURIComponent(authorName)}`;
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Affiliate Recommendations */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-copper">
          Recommended Amazon Kindle Books
        </h2>
        <div className="text-light-gray text-md mb-8">
          If you are just getting into litrpg, these are some of my (and my
          family's) all time favorites. Clicking on any title will take you to
          the amazon page and as an Amazon Associate I earn from qualifying
          purchases.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {AFFILIATE_LINKS.map((book, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl group flex flex-col sm:flex-row lg:flex-col"
            >
              <a
                href={book.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="relative sm:w-48 lg:w-full">
                  <div className="relative pb-[150%] bg-[#1a1a1a]">
                    <img
                      src={book.poster}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-90"
                    />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-copper mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-light-gray text-sm leading-relaxed flex-grow">
                    {book.description}
                  </p>
                  <div className="mt-4 text-xs text-copper opacity-80 font-medium uppercase tracking-wider">
                    View on Amazon →
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Royal Road Books Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-copper">
          Browse Royal Road Books
        </h2>

        {/* Filters */}
        <div className="mb-8 bg-slate p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {LITRPG_RELATED_TAGS.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? "bg-copper text-dark-blue"
                        : "bg-medium-gray text-light-gray"
                    } transition-colors duration-200`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Minimum Rating
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-copper"
              />
              <span className="text-sm text-light-gray">{minRating} stars</span>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 rounded bg-medium-gray text-light-gray border-slate border focus:border-copper focus:ring-1 focus:ring-copper"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-light-gray">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAuthorClick={handleAuthorClick}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
