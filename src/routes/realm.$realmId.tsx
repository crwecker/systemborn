import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { RealmBattlePage } from '../pages/RealmBattlePage'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/realm/$realmId',
  component: RealmBattle,
})

function RealmBattle() {
  const { realmId } = Route.useParams()
  
  return <RealmBattlePage realmId={realmId} />
} 