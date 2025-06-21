import { createFileRoute } from '@tanstack/react-router'
import { BookDetailPage } from '../pages/BookDetailPage'

export const Route = createFileRoute('/book/$bookId')({
  component: BookDetailPage,
}) 