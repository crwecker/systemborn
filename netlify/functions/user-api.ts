import { Handler } from '@netlify/functions';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Verify JWT token and return user
async function verifyAuth(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}

export const handler: Handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    // Remove the /.netlify/functions/user-api prefix from the path
    const cleanPath = event.path.replace(/^\/.netlify\/functions\/user-api\/?/, '');
    const path = cleanPath.split('/').filter(Boolean);
    
    const endpoint = path[0];
    const subEndpoint = path[1];
    const id = path[2];
    
    const params = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // Verify authentication for all endpoints
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization header required' })
      };
    }

    const user = await verifyAuth(authHeader.replace('Bearer ', ''));
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    switch (endpoint) {
      case 'tiers':
        return await handleTiersEndpoint(event.httpMethod, path, user.id, body);
      
      case 'reviews':
        return await handleReviewsEndpoint(event.httpMethod, path, user.id, body);
      
      case 'users':
        if (subEndpoint === user.id || subEndpoint === 'me') {
          if (path[2] === 'tiers') {
            return await getUserTiers(user.id);
          } else if (path[2] === 'reviews') {
            return await getUserReviews(user.id);
          }
        }
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Access denied' })
        };

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
  } catch (error) {
    console.error('Error in user API function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  } finally {
    await prisma.$disconnect();
  }
};

async function handleTiersEndpoint(method: string, path: string[], userId: string, body: any) {
  const tierId = path[1];

  switch (method) {
    case 'GET':
      if (tierId) {
        // Get specific tier
        const tier = await prisma.bookTier.findUnique({
          where: { id: tierId },
          include: { 
            book: {
              include: {
                stats: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        });
        
        if (!tier || tier.userId !== userId) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Tier not found' })
          };
        }
        
        const transformedTier = {
          ...tier,
          book: tier.book ? transformBookForFrontend(tier.book) : null
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(transformedTier)
        };
      } else {
        // Get all user tiers
        return await getUserTiers(userId);
      }

    case 'POST':
      // Create new tier assignment
      const { bookId, tier } = body;
      
      if (!bookId || !tier) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'bookId and tier are required' })
        };
      }

      // Check tier limits
      const tierLimits = { SSS: 1, SS: 3, S: 5 };
      if (tierLimits[tier as keyof typeof tierLimits]) {
        const currentCount = await prisma.bookTier.count({
          where: { userId, tier }
        });
        
        if (currentCount >= tierLimits[tier as keyof typeof tierLimits]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: `Tier ${tier} is full. Maximum ${tierLimits[tier as keyof typeof tierLimits]} books allowed.` 
            })
          };
        }
      }

      const createdTier = await prisma.bookTier.upsert({
        where: {
          userId_bookId: { userId, bookId }
        },
        update: { tier },
        create: { userId, bookId, tier },
        include: { 
          book: {
            include: {
              stats: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      const transformedCreatedTier = {
        ...createdTier,
        book: createdTier.book ? transformBookForFrontend(createdTier.book) : null
      };

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(transformedCreatedTier)
      };

    case 'PUT':
      // Update tier
      if (!tierId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Tier ID is required' })
        };
      }

      const { tier: updatedTierLevel } = body;
      if (!updatedTierLevel) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'tier is required' })
        };
      }

      const existingTier = await prisma.bookTier.findUnique({
        where: { id: tierId }
      });

      if (!existingTier || existingTier.userId !== userId) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Tier not found' })
        };
      }

      const updatedTier = await prisma.bookTier.update({
        where: { id: tierId },
        data: { tier: updatedTierLevel },
        include: { 
          book: {
            include: {
              stats: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      const transformedUpdatedTier = {
        ...updatedTier,
        book: updatedTier.book ? transformBookForFrontend(updatedTier.book) : null
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(transformedUpdatedTier)
      };

    case 'DELETE':
      // Delete tier
      if (!tierId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Tier ID is required' })
        };
      }

      const tierToDelete = await prisma.bookTier.findUnique({
        where: { id: tierId }
      });

      if (!tierToDelete || tierToDelete.userId !== userId) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Tier not found' })
        };
      }

      await prisma.bookTier.delete({
        where: { id: tierId }
      });

      return {
        statusCode: 204,
        headers,
        body: ''
      };

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

async function handleReviewsEndpoint(method: string, path: string[], userId: string, body: any) {
  const reviewId = path[1];

  switch (method) {
    case 'GET':
      if (reviewId) {
        // Get specific review
        const review = await prisma.bookReview.findUnique({
          where: { id: reviewId },
          include: { 
            book: {
              include: {
                stats: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        });
        
        if (!review || review.userId !== userId) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Review not found' })
          };
        }
        
        const transformedReview = {
          ...review,
          book: review.book ? transformBookForFrontend(review.book) : null
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(transformedReview)
        };
      } else {
        // Get all user reviews
        return await getUserReviews(userId);
      }

    case 'POST':
      // Create new review
      const { bookId, review } = body;
      
      if (!bookId || !review) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'bookId and review are required' })
        };
      }

      const newReview = await prisma.bookReview.upsert({
        where: {
          userId_bookId: { userId, bookId }
        },
        update: { review },
        create: { userId, bookId, review },
        include: { 
          book: {
            include: {
              stats: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      const transformedNewReview = {
        ...newReview,
        book: newReview.book ? transformBookForFrontend(newReview.book) : null
      };

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(transformedNewReview)
      };

    case 'PUT':
      // Update review
      if (!reviewId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Review ID is required' })
        };
      }

      const { review: updatedReviewText } = body;
      if (!updatedReviewText) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'review is required' })
        };
      }

      const existingReview = await prisma.bookReview.findUnique({
        where: { id: reviewId }
      });

      if (!existingReview || existingReview.userId !== userId) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Review not found' })
        };
      }

      const updatedReview = await prisma.bookReview.update({
        where: { id: reviewId },
        data: { review: updatedReviewText },
        include: { book: true }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedReview)
      };

    case 'DELETE':
      // Delete review
      if (!reviewId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Review ID is required' })
        };
      }

      const reviewToDelete = await prisma.bookReview.findUnique({
        where: { id: reviewId }
      });

      if (!reviewToDelete || reviewToDelete.userId !== userId) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Review not found' })
        };
      }

      await prisma.bookReview.delete({
        where: { id: reviewId }
      });

      return {
        statusCode: 204,
        headers,
        body: ''
      };

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

async function getUserTiers(userId: string) {
  const tiers = await prisma.bookTier.findMany({
    where: { userId },
    include: { 
      book: {
        include: {
          stats: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: [
      { tier: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  // Transform the data to match frontend expectations
  const transformedTiers = tiers.map(tier => ({
    ...tier,
    book: tier.book ? transformBookForFrontend(tier.book) : null
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(transformedTiers)
  };
}

// Helper function to transform database book to frontend format
function transformBookForFrontend(dbBook: any) {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: {
      name: dbBook.authorName,
    },
    description: dbBook.description,
    tags: dbBook.tags,
    image: dbBook.coverUrl || "",
    url: dbBook.sourceUrl,
    rating: dbBook.stats?.[0]?.rating || 0,
    coverUrl: dbBook.coverUrl || "",
    contentWarnings: dbBook.contentWarnings || [],
    stats: {
      followers: dbBook.stats?.[0]?.followers || 0,
      views: {
        total: dbBook.stats?.[0]?.views || 0,
        average: dbBook.stats?.[0]?.average_views || 0
      },
      pages: dbBook.stats?.[0]?.pages || 0,
      favorites: dbBook.stats?.[0]?.favorites || 0,
      ratings_count: dbBook.stats?.[0]?.ratings_count || 0,
      overall_score: dbBook.stats?.[0]?.overall_score || 0,
      style_score: dbBook.stats?.[0]?.style_score || 0,
      story_score: dbBook.stats?.[0]?.story_score || 0,
      grammar_score: dbBook.stats?.[0]?.grammar_score || 0,
      character_score: dbBook.stats?.[0]?.character_score || 0
    }
  };
}

async function getUserReviews(userId: string) {
  const reviews = await prisma.bookReview.findMany({
    where: { userId },
    include: { 
      book: {
        include: {
          stats: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform the data to match frontend expectations
  const transformedReviews = reviews.map(review => ({
    ...review,
    book: review.book ? transformBookForFrontend(review.book) : null
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(transformedReviews)
  };
} 