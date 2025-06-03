import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../services/api';

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.space.lg};
  padding: ${props => props.theme.space.lg};
`;

const BookCard = styled.div`
  background: ${props => props.theme.colors.darkBlue};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const BookCover = styled.img`
  width: 100%;
  height: 350px;
  object-fit: cover;
`;

const BookInfo = styled.div`
  padding: ${props => props.theme.space.md};
  color: ${props => props.theme.colors.lightGray};
`;

const BookTitle = styled.h2`
  color: ${props => props.theme.colors.copper};
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: ${props => props.theme.space.xs};
`;

const BookAuthor = styled.p`
  color: ${props => props.theme.colors.lightGray};
  font-size: ${props => props.theme.fontSizes.md};
  margin-bottom: ${props => props.theme.space.sm};
`;

const BookTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.space.xs};
  margin-top: ${props => props.theme.space.sm};
`;

const Tag = styled.span`
  background: ${props => props.theme.colors.slate};
  color: ${props => props.theme.colors.lightGray};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Rating = styled.div`
  color: ${props => props.theme.colors.copper};
  font-size: ${props => props.theme.fontSizes.lg};
  margin-top: ${props => props.theme.space.sm};
`;

const LoadingOrError = styled.div`
  text-align: center;
  padding: ${props => props.theme.space.xl};
  color: ${props => props.theme.colors.lightGray};
  font-size: ${props => props.theme.fontSizes.lg};
`;

export function BookList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books', 1],
    queryFn: () => fetchBooks(1),
  });

  if (isLoading) {
    return <LoadingOrError>Loading books...</LoadingOrError>;
  }

  if (error) {
    return <LoadingOrError>Error loading books: {error instanceof Error ? error.message : 'Unknown error'}</LoadingOrError>;
  }

  return (
    <BookGrid>
      {data?.books.map((book) => (
        <BookCard key={book.id}>
          <a href={book.url} target="_blank" rel="noopener noreferrer">
            <BookCover src={book.coverUrl} alt={book.title} />
          </a>
          <BookInfo>
            <BookTitle>{book.title}</BookTitle>
            <BookAuthor>by {book.author}</BookAuthor>
            <Rating>★ {book.rating.toFixed(1)}</Rating>
            <BookTags>
              {book.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </BookTags>
          </BookInfo>
        </BookCard>
      ))}
    </BookGrid>
  );
} 