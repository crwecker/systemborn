import { createRoute } from '@tanstack/react-router'
import { SignUp } from '../pages/SignUp'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUp,
}) 