import { createRoute } from '@tanstack/react-router'
import { SmartAuth } from '../pages/SmartAuth'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: SmartAuth,
})
