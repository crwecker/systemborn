import { createRoute } from '@tanstack/react-router'
import { SignIn } from '../pages/SignIn'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignIn,
}) 