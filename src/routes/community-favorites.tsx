import { createFileRoute } from '@tanstack/react-router'
import CommunityFavorites from '../pages/CommunityFavorites'

export const Route = createFileRoute('/community-favorites')({
  component: CommunityFavorites,
}) 