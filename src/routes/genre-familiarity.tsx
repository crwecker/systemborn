import { createRoute } from '@tanstack/react-router'
import { GenreFamiliarity } from '../pages/GenreFamiliarity'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/genre-familiarity',
  component: GenreFamiliarity,
}) 