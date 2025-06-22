import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { AcademyPage } from '../pages/AcademyPage'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/academy',
  component: Academy,
})

function Academy() {
  return <AcademyPage />
} 