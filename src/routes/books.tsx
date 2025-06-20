import { createRoute } from '@tanstack/react-router'
import { Banner } from '../components/Banner'
import { BooksPage } from '../pages/Books'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/books',
  component: Books,
})

function Books() {
  return (
    <>
      <Banner />
      <main className='container mx-auto py-6'>
        <BooksPage />
      </main>
    </>
  )
} 