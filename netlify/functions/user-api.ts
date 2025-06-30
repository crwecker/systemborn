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

// Experience rewards for different activities
const EXPERIENCE_REWARDS = {
  READING_STATUS: 15, // Small amount for marking as read/reading
  FIRST_S_TIER: 45,   // Bigger amount for first S tier
  FIRST_SS_TIER: 75,  // Bigger amount for first SS tier  
  FIRST_SSS_TIER: 120, // Large amount for first SSS tier
  REVIEW: 30,         // Bigger amount for leaving a review
  BOSS_VICTORY: 60,   // Bonus for participating in boss defeat
  WRITING: 1,         // 1 minute per minute written (1:1 ratio)
};

// Helper function to award bonus experience by creating battle activities for ALL realms
async function awardBonusExperience(
  userId: string, 
  bookId: string, 
  activityType: keyof typeof EXPERIENCE_REWARDS,
  description: string
) {
  const minutes = EXPERIENCE_REWARDS[activityType];
  
  // Map experience reward types to database activity types
  const activityTypeMapping = {
    READING_STATUS: 'READING_STATUS',
    FIRST_S_TIER: 'TIER_ASSIGNMENT',
    FIRST_SS_TIER: 'TIER_ASSIGNMENT', 
    FIRST_SSS_TIER: 'TIER_ASSIGNMENT',
    REVIEW: 'REVIEW',
    BOSS_VICTORY: 'BOSS_VICTORY',
    WRITING: 'WRITING'
  } as const;
  
  const dbActivityType = activityTypeMapping[activityType];
  
  // Award experience to ALL realms instead of just the matching one
  const allRealms = ['XIANXIA', 'GAMELIT', 'APOCALYPSE', 'ISEKAI'];
  const bossNames: Record<string, string> = {
    XIANXIA: 'Longzu, The Heaven-Scourging Flame',
    GAMELIT: 'Glitchlord Exeon',
    APOCALYPSE: 'Zereth, Dungeon Architect of the End',
    ISEKAI: 'Aurelion the Eternal Return'
  };
  
  for (const realmName of allRealms) {
    // Get or create the realm boss
    let realmBoss = await prisma.realmBoss.findUnique({
      where: { realm: realmName as any }
    });
    
    if (!realmBoss) {
      realmBoss = await prisma.realmBoss.create({
        data: {
          realm: realmName as any,
          name: bossNames[realmName] || 'Unknown Boss',
          maxHitpoints: 10000,
          currentHitpoints: 10000
        }
      });
    }
    
    // Create the bonus battle activity for this realm
    await prisma.battleActivity.create({
      data: {
        userId,
        realmBossId: realmBoss.id,
        bookId,
        minutesRead: minutes,
        damage: dbActivityType === 'WRITING' ? minutes : 0, // Writing deals damage, others are pure bonus
        activityType: dbActivityType,
        isBonus: true
      }
    });
  }
  
  console.log(`Awarded ${minutes} bonus minutes to ALL realms for user ${userId} for ${activityType}: ${description}`);
}


// Helper function to check if user has earned a tier achievement before  
async function hasEarnedTierAchievement(userId: string, tier: 'S' | 'SS' | 'SSS'): Promise<boolean> {
  const existingTierCount = await prisma.bookTier.count({
    where: { 
      userId, 
      tier: tier as any,
      createdAt: { lt: new Date() } // Any previous assignments of this tier
    }
  });
  
  return existingTierCount > 0;
}

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
      
      case 'reading-status':
        return await handleReadingStatusEndpoint(event.httpMethod, user.id, body);
      
      case 'reviews':
        return await handleReviewsEndpoint(event.httpMethod, path, user.id, body);
      
      case 'writing':
        return await handleWritingEndpoint(event.httpMethod, user.id, body);
      
      case 'community-favorites':
        if (event.httpMethod === 'GET') {
          return await getCommunityFavorites();
        }
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      
      case 'top-tier-books':
        if (event.httpMethod === 'GET') {
          return await getTopTierBooks(params);
        }
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      
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
      const { bookId, tier, readingStatus } = body;
      
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

      // Check if this is the user's first time earning this tier level
      const isFirstTimeAchievement = ['S', 'SS', 'SSS'].includes(tier) && 
        !(await hasEarnedTierAchievement(userId, tier as 'S' | 'SS' | 'SSS'));

      const createdTier = await prisma.bookTier.upsert({
        where: {
          userId_bookId: { userId, bookId }
        },
        update: { 
          tier,
          ...(readingStatus && { readingStatus })
        },
        create: { 
          userId, 
          bookId, 
          tier,
          readingStatus: readingStatus || 'FINISHED'
        },
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

      // Award bonus experience for first-time tier achievements
      if (isFirstTimeAchievement) {
        const tierExpRewards = {
          'S': 'FIRST_S_TIER' as const,
          'SS': 'FIRST_SS_TIER' as const, 
          'SSS': 'FIRST_SSS_TIER' as const
        };
        
        const rewardType = tierExpRewards[tier as keyof typeof tierExpRewards];
        if (rewardType) {
          await awardBonusExperience(
            userId,
            bookId,
            rewardType,
            `First time earning ${tier} tier with "${createdTier.book?.title}"`
          );
        }
      }

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

async function handleReadingStatusEndpoint(method: string, userId: string, body: any) {
  switch (method) {
    case 'POST':
      // Update reading status
      const { bookId, readingStatus } = body;
      
      if (!bookId || !readingStatus) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'bookId and readingStatus are required' })
        };
      }

      // Check if this is a new reading status assignment
      const existingTier = await prisma.bookTier.findUnique({
        where: { userId_bookId: { userId, bookId } }
      });
      
      const isNewAssignment = !existingTier || existingTier.readingStatus !== readingStatus;

      const updatedTier = await prisma.bookTier.upsert({
        where: {
          userId_bookId: { userId, bookId }
        },
        update: { readingStatus },
        create: { 
          userId, 
          bookId, 
          readingStatus
          // tier is optional and will default to null
        },
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

      // Award bonus experience for reading status changes (FINISHED or READING)
      if (isNewAssignment && (readingStatus === 'FINISHED' || readingStatus === 'READING')) {
        await awardBonusExperience(
          userId, 
          bookId, 
          'READING_STATUS', 
          `Marked "${updatedTier.book?.title}" as ${readingStatus.toLowerCase()}`
        );
      }

      const transformedTier = {
        ...updatedTier,
        book: updatedTier.book ? transformBookForFrontend(updatedTier.book) : null
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(transformedTier)
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

      // Check if this is a new review (not an update)
      const currentReview = await prisma.bookReview.findUnique({
        where: { userId_bookId: { userId, bookId } }
      });
      
      const isNewReview = !currentReview;

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

      // Award bonus experience for creating a new review
      if (isNewReview) {
        await awardBonusExperience(
          userId,
          bookId,
          'REVIEW',
          `Left a review for "${newReview.book?.title}"`
        );
      }

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

async function handleWritingEndpoint(method: string, userId: string, body: any) {
  switch (method) {
    case 'POST':
      // Record writing minutes
      const { bookId, minutes } = body;
      
      if (!bookId || !minutes || typeof minutes !== 'number' || minutes <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'bookId and positive minutes are required' })
        };
      }

      // Get book details for the activity description
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { title: true }
      });

      if (!book) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Book not found' })
        };
      }

      // Award writing experience to all realms (1 minute written = 1 minute experience)
      await awardBonusExperience(
        userId,
        bookId,
        'WRITING',
        `Wrote ${minutes} minutes for "${book.title}"`
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: `${minutes} writing minutes added to all realms`,
          bookTitle: book.title,
          minutesAwarded: minutes
        })
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

async function getCommunityFavorites() {
  // Get all users who have SSS, SS, or S tier books
  const usersWithFavorites = await prisma.user.findMany({
    where: {
      bookTiers: {
        some: {
          tier: { in: ['SSS', 'SS', 'S'] }
        }
      }
    },
    include: {
      bookTiers: {
        where: {
          tier: { in: ['SSS', 'SS', 'S'] }
        },
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
      }
    }
  });

  // Transform the data for frontend
  const communityData: { [userId: string]: { user: { name: string; id: string }; tiers: any[] } } = {};
  
  usersWithFavorites.forEach(user => {
    if (user.bookTiers.length > 0) {
      communityData[user.id] = {
        user: {
          name: `${user.firstName} ${user.lastName.charAt(0)}.`,
          id: user.id
        },
        tiers: user.bookTiers.map(tier => ({
          ...tier,
          book: tier.book ? transformBookForFrontend(tier.book) : null
        }))
      };
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(communityData)
  };
}

async function getTopTierBooks(params: any) {
  try {
    // Parse tags from query parameters
    const tags = params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : [];
    
    // Get all books that are in SSS, SS, or S tiers (no tag filtering initially)
    const topTierBooks = await prisma.book.findMany({
      where: {
        bookTiers: {
          some: {
            tier: { in: ['SSS', 'SS', 'S'] }
          }
        }
      },
      include: {
        stats: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        bookTiers: {
          where: {
            tier: { in: ['SSS', 'SS', 'S'] }
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: [
        { bookTiers: { _count: 'desc' } }, // Books with more tier assignments first
      ],
      take: 50 // Get more books initially so we can filter and still have enough
    });

    // Transform the data to match the frontend interface
    const transformedBooks = topTierBooks.map(book => {
      // Group tier assignments by tier level
      const tierGroups: { [key: string]: { tier: string; userCount: number; users: Array<{ id: string; name: string }> } } = {};
      
      book.bookTiers.forEach(tierAssignment => {
        const tier = tierAssignment.tier;
        if (!tier) return; // Skip if tier is null
        
        if (!tierGroups[tier]) {
          tierGroups[tier] = {
            tier,
            userCount: 0,
            users: []
          };
        }
        
        tierGroups[tier].userCount++;
        tierGroups[tier].users.push({
          id: tierAssignment.user.id,
          name: `${tierAssignment.user.firstName} ${tierAssignment.user.lastName.charAt(0)}.`
        });
      });

      return {
        book: transformBookForFrontend(book),
        tierAssignments: Object.values(tierGroups).sort((a, b) => {
          // Sort by tier priority: SSS > SS > S
          const tierOrder = { 'SSS': 0, 'SS': 1, 'S': 2 };
          return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
        })
      };
    });

    // Filter and prioritize books based on tags if provided
    let filteredBooks = transformedBooks;
    if (tags.length > 0) {
      // Separate books that match tags from those that don't
      const matchingBooks = transformedBooks.filter(item => {
        const bookTags = item.book.tags || [];
        return tags.some(tag => 
          bookTags.some(bookTag => 
            bookTag.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(bookTag.toLowerCase())
          )
        );
      });
      
      const nonMatchingBooks = transformedBooks.filter(item => {
        const bookTags = item.book.tags || [];
        return !tags.some(tag => 
          bookTags.some(bookTag => 
            bookTag.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(bookTag.toLowerCase())
          )
        );
      });
      
      // Prioritize matching books, but include non-matching ones if we need more
      filteredBooks = [...matchingBooks, ...nonMatchingBooks].slice(0, 20);
    } else {
      // If no tags provided, just take the first 20
      filteredBooks = transformedBooks.slice(0, 20);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(filteredBooks)
    };
  } catch (error) {
    console.error('Error fetching top tier books:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch top tier books' })
    };
  }
} 