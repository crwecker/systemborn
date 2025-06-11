import { createFileRoute } from '@tanstack/react-router';
import BookReviews from '../components/BookReviews';

export const Route = createFileRoute('/my-reviews')({
  component: BookReviews,
}); 