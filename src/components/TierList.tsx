import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { fetchUserBookTiers, removeBookFromTiers, updateBookTier } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { BookTier, TierLevel, TierData } from '../types/book';
import { TIER_CONFIG } from '../types/book';
import { SimplifiedBookCard } from './SimplifiedBookCard';

// Tier Droppable Component
interface TierDroppableProps {
  tier: TierLevel;
  children: React.ReactNode;
  className?: string;
}

const TierDroppable: React.FC<TierDroppableProps> = ({ tier, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier });

  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

// Draggable Book Item Component
interface DraggableBookItemProps {
  bookTier: BookTier;
  onRemove: (tierId: string) => void;
}

const DraggableBookItem: React.FC<DraggableBookItemProps> = ({ bookTier, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookTier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      {bookTier.book && (
        <div className="relative">
          <SimplifiedBookCard book={bookTier.book} tier={bookTier.tier} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(bookTier.id);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors z-10"
            title="Remove from tier"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

const TierList: React.FC = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: bookTiers = [], isLoading } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => user ? fetchUserBookTiers(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const removeTierMutation = useMutation({
    mutationFn: (tierId: string) => removeBookFromTiers(tierId),
    onMutate: async (tierId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userBookTiers', user?.id] });

      // Snapshot the previous value
      const previousBookTiers = queryClient.getQueryData<BookTier[]>(['userBookTiers', user?.id]);

      // Optimistically remove the book tier
      if (previousBookTiers) {
        const updatedBookTiers = previousBookTiers.filter(bookTier => bookTier.id !== tierId);
        queryClient.setQueryData(['userBookTiers', user?.id], updatedBookTiers);
      }

      return { previousBookTiers };
    },
    onError: (err, tierId, context) => {
      // Rollback on error
      if (context?.previousBookTiers) {
        queryClient.setQueryData(['userBookTiers', user?.id], context.previousBookTiers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers', user?.id] });
    }
  });

  const updateTierMutation = useMutation({
    mutationFn: ({ tierId, tier }: { tierId: string; tier: TierLevel }) => 
      updateBookTier(tierId, tier),
    onMutate: async ({ tierId, tier }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['userBookTiers', user?.id] });

      // Snapshot the previous value
      const previousBookTiers = queryClient.getQueryData<BookTier[]>(['userBookTiers', user?.id]);

      // Optimistically update to the new value
      if (previousBookTiers) {
        const updatedBookTiers = previousBookTiers.map(bookTier =>
          bookTier.id === tierId ? { ...bookTier, tier } : bookTier
        );
        queryClient.setQueryData(['userBookTiers', user?.id], updatedBookTiers);
      }

      // Return a context object with the snapshotted value
      return { previousBookTiers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookTiers) {
        queryClient.setQueryData(['userBookTiers', user?.id], context.previousBookTiers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['userBookTiers', user?.id] });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Organize books by tier
  const tierData: TierData[] = Object.entries(TIER_CONFIG).map(([tierLevel, config]) => ({
    tier: tierLevel as TierLevel,
    books: bookTiers.filter(bt => bt.tier === tierLevel),
    maxBooks: config.maxBooks
  }));

  const handleRemoveFromTier = (tierId: string) => {
    if (window.confirm('Remove this book from your tier list?')) {
      removeTierMutation.mutate(tierId);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the book tier being dragged
    const activeBookTier = bookTiers.find(bt => bt.id === activeId);
    if (!activeBookTier) return;

    // Determine the target tier from the droppable area
    let targetTier: TierLevel | null = null;
    
    // If dropped on another book, get that book's tier
    const overBookTier = bookTiers.find(bt => bt.id === overId);
    if (overBookTier) {
      targetTier = overBookTier.tier;
    } else {
      // If dropped on a tier container, use that tier
      targetTier = overId as TierLevel;
    }

    if (!targetTier || targetTier === activeBookTier.tier) return;

    // Check tier limits
    const tierConfig = TIER_CONFIG[targetTier];
    const currentBooksInTier = bookTiers.filter(bt => bt.tier === targetTier).length;
    
    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(`Tier ${targetTier} is full! Maximum ${tierConfig.maxBooks} books allowed.`);
      return;
    }

    // Update the tier
    updateTierMutation.mutate({ tierId: activeId, tier: targetTier });
  };

  // Get the active book for drag overlay
  const activeBookTier = activeId ? bookTiers.find(bt => bt.id === activeId) : null;

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to manage your book tiers.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your book tiers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Book Tier List</h1>
        <p className="text-gray-600">
          Your books organized into tiers based on your preferences. Drag books between tiers to reorganize them.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
          <div className="space-y-6">
            {tierData.map(({ tier, books, maxBooks }) => {
              const config = TIER_CONFIG[tier];
              
              return (
                <TierDroppable key={tier} tier={tier} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`px-4 py-2 rounded-lg text-white font-bold ${config.color}`}>
                        {config.name}
                      </div>
                      <span className="text-sm text-gray-500">
                        {books.length} book{books.length !== 1 ? 's' : ''}
                        {maxBooks && ` / ${maxBooks} max`}
                      </span>
                    </div>
                  </div>

                  <div className="min-h-[200px] p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
                    <SortableContext items={books.map(b => b.id)} strategy={rectSortingStrategy}>
                      {books.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                          <p>Drop books here to add them to {config.name}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                          {books.map((bookTier) => (
                            <DraggableBookItem
                              key={bookTier.id}
                              bookTier={bookTier}
                              onRemove={handleRemoveFromTier}
                            />
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  </div>
                </TierDroppable>
              );
            })}
          </div>

          <DragOverlay>
            {activeBookTier?.book && (
              <div className="opacity-80">
                <SimplifiedBookCard book={activeBookTier.book} tier={activeBookTier.tier} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About your tier list:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>SSS Tier:</strong> Your current absolute favorite book (1 book max)</li>
          <li>• <strong>SS Tier:</strong> Your top-tier favorites (3 books max)</li>
          <li>• <strong>S Tier:</strong> Excellent books you highly recommend (5 books max)</li>
          <li>• <strong>A-F Tiers:</strong> Organize the rest of your books as you see fit (unlimited)</li>
          <li>• Add books to tiers from individual book pages</li>
          <li>• Drag books between tiers to reorganize them</li>
          <li>• Click the × button to remove books from your tier list</li>
        </ul>
      </div>
    </div>
  );
};

export default TierList; 