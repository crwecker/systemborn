import { createRoute } from '@tanstack/react-router'
import { AddBook } from '../pages/AddBook'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-book',
  component: AddBook,
})
