import { createFileRoute } from '@tanstack/react-router';
import TierList from '../components/TierList';

export const Route = createFileRoute('/my-tiers')({
  component: TierList,
}); 