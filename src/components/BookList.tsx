import { useQuery } from '@tanstack/react-query'
import { fetchBooks } from '../services/api'

export function BookList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books', 1],
    queryFn: () => fetchBooks(1),
  })

  if (isLoading) {
    return (
      <div className='text-center py-8 text-light-gray text-lg'>
        Loading books...
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8 text-light-gray text-lg'>
        Error loading books:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6'>
      {data?.books.map(book => (
        <div
          key={book.id}
          className='bg-dark-blue rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform duration-200 hover:-translate-y-1'>
          <a
            href={book.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'>
            <img
              src={book.coverUrl}
              alt={book.title}
              className='w-full h-[350px] object-cover'
            />
          </a>
          <div className='p-4 text-light-gray'>
            <h2 className='text-copper text-xl mb-1'>{book.title}</h2>
            <p className='text-light-gray text-base mb-2'>
              by {book.author.name}
            </p>
            <div className='text-copper text-lg mb-2'>
              ★ {book.rating.toFixed(1)}
            </div>
            <div className='flex flex-wrap gap-1'>
              {book.tags.map(tag => (
                <span
                  key={tag}
                  className='bg-slate text-light-gray px-2 py-1 rounded text-sm'>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
