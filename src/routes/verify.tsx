import { createRoute } from '@tanstack/react-router'
import { Verify } from '../pages/Verify'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: Verify,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || undefined,
  }),
}) 