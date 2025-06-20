import { Handler } from '@netlify/functions';
import { prisma } from '../../lib/prisma';
import {
  fetchBooks,
  fetchBookDetails,
  getLitRPGBooks,
  getTrendingLitRPGBooks,
  searchBooks,
  getSimilarBooks,
  getAuthorBooks,
  getPopularTags,
  setPrismaInstance
} from '../../lib/royalroad';

// Set the Prisma instance for the service
setPrismaInstance(prisma);

// Helper function to get boss names
function getBossName(realm: string): string {
  const bossNames = {
    XIANXIA: 'Longzu, The Heaven-Scourging Flame',
    GAMELIT: 'Glitchlord Exeon', 
    APOCALYPSE: 'Zereth, Dungeon Architect of the End',
    ISEKAI: 'Aurelion the Eternal Return'
  };
  return bossNames[realm as keyof typeof bossNames] || 'Unknown Boss';
}

// Story generation system
function generateBossIntroduction(realm: string, bossName: string): string {
  const introductions = {
    XIANXIA: `🐲 The ancient temple trembles as ${bossName} awakens from his thousand-year slumber. His jade scales shimmer with celestial fire, and his golden eyes burn with the wisdom of eons. The Ancestor Dragon speaks: "Mortals dare to approach my domain? Your cultivation is insufficient... but perhaps your determination might prove interesting." The air crackles with tribulation lightning as the battle begins.`,
    
    GAMELIT: `💻 Reality glitches as ${bossName} materializes from corrupted code fragments. His form flickers between pixelated sprites and hyper-realistic renders. "INITIATING FINAL BOSS PROTOCOL..." his voice echoes with digital distortion. "ERROR: PLAYERS DETECTED. DEPLOYING COUNTERMEASURES. PREPARE FOR SYSTEM OVERRIDE." The arena transforms into a digital battleground where books become weapons of code.`,
    
    APOCALYPSE: `⚔️ The wasteland shudders as ${bossName} emerges from his reality-dungeon. Obsidian armor gleams with shifting runes, and floating hex tiles orbit around his imposing figure. "Welcome to my final test, survivors," his voice resonates like grinding stone. "You have read to strengthen yourselves. Now prove your worth in the crucible I have prepared. Only the strongest deserve to see the world's end."`,
    
    ISEKAI: `✨ Dimensional rifts tear open as ${bossName} manifests across multiple planes simultaneously. Golden-white robes flutter with memories of ten thousand lives. "Another cycle begins," he intones, weapons from countless worlds materializing around him. "I have died and been reborn more times than stars in the sky. Your reading strengthens your souls... but will it be enough to face one who has mastered death itself?"`
  };
  return introductions[realm as keyof typeof introductions] || `${bossName} appears, ready for battle!`;
}

function generateBattleAction(realm: string, userName: string, damage: number, bookTitle?: string): string {
  const actionTemplates = {
    XIANXIA: [
      `🔥 ${userName} channels their reading qi, dealing ${damage} spiritual damage! ${bookTitle ? `The wisdom from "${bookTitle}" enhances their cultivation!` : 'Their literary foundation grows stronger!'}`,
      `⚡ Lightning tribulation strikes as ${userName} advances their reading realm by ${damage} points! ${bookTitle ? `"${bookTitle}" becomes their sacred text!` : 'The heavens acknowledge their dedication!'}`,
      `🌟 ${userName} achieves breakthrough enlightenment, inflicting ${damage} dao damage! ${bookTitle ? `The insights from "${bookTitle}" pierce through illusion!` : 'Their comprehension deepens!'}`
    ],
    
    GAMELIT: [
      `💾 ${userName} executes a critical read() function, dealing ${damage} data damage! ${bookTitle ? `Buffer overflow from "${bookTitle}" crashes enemy defenses!` : 'Memory allocation optimized!'}`,
      `🎮 ${userName} exploits a narrative bug for ${damage} damage! ${bookTitle ? `"${bookTitle}" provides unlimited ammo cheat!` : 'System resources reallocated!'}`,
      `⚡ ${userName} compiles ${damage} lines of story code! ${bookTitle ? `"${bookTitle}" library imported successfully!` : 'Debug mode activated!'}`
    ],
    
    APOCALYPSE: [
      `💀 ${userName} survives another chapter, gaining ${damage} experience points! ${bookTitle ? `"${bookTitle}" serves as their survival guide!` : 'Wasteland wisdom acquired!'}`,
      `🔥 ${userName} scavenges ${damage} knowledge fragments from the literary wasteland! ${bookTitle ? `"${bookTitle}" reveals hidden cache locations!` : 'Resources secured!'}`,
      `⚔️ ${userName} adapts and overcomes, dealing ${damage} survivor damage! ${bookTitle ? `Tactics from "${bookTitle}" prove effective!` : 'Evolution through adversity!'}`
    ],
    
    ISEKAI: [
      `✨ ${userName} draws power from their past life memories, dealing ${damage} reincarnation damage! ${bookTitle ? `"${bookTitle}" unlocks hidden abilities!` : 'Soul strength increases!'}`,
      `🌀 ${userName} channels otherworldly knowledge for ${damage} isekai damage! ${bookTitle ? `"${bookTitle}" bridges dimensional wisdom!` : 'Reality bends to their will!'}`,
      `👑 ${userName} levels up their protagonist powers, inflicting ${damage} main character damage! ${bookTitle ? `"${bookTitle}" becomes their legendary artifact!` : 'Destiny alignment achieved!'}`
    ]
  };
  
  const templates = actionTemplates[realm as keyof typeof actionTemplates] || [
    `${userName} attacks for ${damage} damage! ${bookTitle ? `Reading "${bookTitle}" empowers them!` : 'Knowledge is power!'}`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateMilestone(realm: string, milestone: string): string {
  const milestoneTemplates = {
    XIANXIA: `🏆 The heavens tremble! ${milestone} A celestial tribulation acknowledges this achievement!`,
    GAMELIT: `🎯 ACHIEVEMENT UNLOCKED: ${milestone} +1000 XP to all participants!`,
    APOCALYPSE: `📡 BROADCAST: ${milestone} All survivors gain morale boost!`,
    ISEKAI: `🌟 DIVINE BLESSING: ${milestone} The gods smile upon your efforts!`
  };
  return milestoneTemplates[realm as keyof typeof milestoneTemplates] || `🎉 ${milestone}`;
}

async function addStoryEntry(realmBossId: string, entryType: string, content: string, metadata: any = {}) {
  return await prisma.battleStory.create({
    data: {
      realmBossId,
      entryType: entryType as any,
      content,
      metadata
    }
  });
}

// Calculate current HP based on damage in battle story entries
async function calculateCurrentHP(boss: { id: string; maxHitpoints: number }): Promise<number> {
  // Get all story entries in chronological order since last reset/introduction
  const lastReset = await prisma.battleStory.findFirst({
    where: {
      realmBossId: boss.id,
      entryType: 'BOSS_DEFEAT'
    },
    orderBy: { createdAt: 'desc' }
  });

  // If no reset found, look for the boss introduction as the starting point
  const startPoint = lastReset || await prisma.battleStory.findFirst({
    where: {
      realmBossId: boss.id,
      entryType: 'BOSS_INTRODUCTION'
    },
    orderBy: { createdAt: 'asc' }
  });

  const storyEntries = await prisma.battleStory.findMany({
    where: {
      realmBossId: boss.id,
      createdAt: startPoint ? { gt: startPoint.createdAt } : undefined,
      entryType: 'BATTLE_ACTION' // Only count battle actions for damage
    },
    orderBy: { createdAt: 'asc' }
  });

  // Start at max HP and subtract damage from each story entry
  let currentHP = boss.maxHitpoints;
  
  for (const entry of storyEntries) {
    // Extract damage from metadata if available
    const damage = entry.metadata && typeof entry.metadata === 'object' && 'damage' in entry.metadata 
      ? Number(entry.metadata.damage) 
      : 0;
    
    if (damage > 0) {
      currentHP = Math.max(0, currentHP - damage);
      // If boss reaches 0 HP, it would have respawned, so we can stop here
      if (currentHP === 0) {
        break;
      }
    }
  }

  return currentHP;
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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
    console.log('Database URL:', process.env.DATABASE_URL); // Log the database URL (without sensitive parts)
    console.log('Request path:', event.path);
    console.log('Request method:', event.httpMethod);
    console.log('Query parameters:', event.queryStringParameters);

    // Remove the /.netlify/functions/api prefix from the path
    const cleanPath = event.path.replace(/^\/.netlify\/functions\/api\/?/, '');
    const path = cleanPath.split('/').filter(Boolean);
    console.log('Parsed path segments:', path);
    
    // Handle root API call
    if (path.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'API is running' })
      };
    }

    const endpoint = path[0];
    console.log('Endpoint:', endpoint);
    
    const params = event.queryStringParameters || {};

    switch (endpoint) {
      case 'tags':
        const popularTags = await getPopularTags(12);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(popularTags)
        };

      case 'books':
        const subEndpoint = path[1];
        console.log('Books subEndpoint:', subEndpoint);
        
        // Handle POST request to create a new book
        if (event.httpMethod === 'POST' && !subEndpoint) {
          try {
            const bookData = JSON.parse(event.body || '{}');
            
            // Validate required fields
            const requiredFields = ['id', 'title', 'authorName', 'description', 'sourceUrl', 'source'];
            for (const field of requiredFields) {
              if (!bookData[field]) {
                return {
                  statusCode: 400,
                  headers,
                  body: JSON.stringify({ error: `${field} is required` })
                };
              }
            }

            // Create book in database
            const newBook = await prisma.book.create({
              data: {
                id: bookData.id,
                title: bookData.title,
                authorName: bookData.authorName,
                description: bookData.description,
                tags: bookData.tags || [],
                coverUrl: bookData.coverUrl || null,
                sourceUrl: bookData.sourceUrl,
                source: bookData.source,
                contentWarnings: bookData.contentWarnings || []
              }
            });

            // Create initial stats entry
            await prisma.bookStats.create({
              data: {
                bookId: newBook.id,
                rating: bookData.rating || 0,
                followers: bookData.followers || 0,
                views: bookData.views || 0,
                pages: bookData.pages || 0,
                average_views: bookData.average_views || 0,
                favorites: bookData.favorites || 0,
                ratings_count: bookData.ratings_count || 0,
                character_score: bookData.character_score || 0,
                grammar_score: bookData.grammar_score || 0,
                overall_score: bookData.overall_score || 0,
                story_score: bookData.story_score || 0,
                style_score: bookData.style_score || 0
              }
            });

            return {
              statusCode: 201,
              headers,
              body: JSON.stringify({ 
                message: 'Book created successfully', 
                book: newBook 
              })
            };
          } catch (error) {
            console.error('Error creating book:', error);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ 
                error: 'Failed to create book',
                details: error instanceof Error ? error.message : 'Unknown error'
              })
            };
          }
        }
        
        try {
          switch (subEndpoint) {
            case 'litrpg':
              const books = await getLitRPGBooks();
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(books)
              };

            case 'trending':
              const limit = params.limit ? parseInt(params.limit) : 10;
              const trendingBooks = await getTrendingLitRPGBooks(limit);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(trendingBooks)
              };

            case 'amazon':
              // Get all Amazon books (affiliate recommendations)
              const amazonBooks = await prisma.book.findMany({
                where: { source: 'AMAZON' },
                include: {
                  bookContributors: {
                    include: {
                      contributor: true
                    }
                  },
                  bookReviews: {
                    where: { userId: 'cmbjdfr1c0000kyu3giis7lz2' }, // Admin/reviewer user
                    take: 1
                  }
                },
                orderBy: { createdAt: 'asc' }
              });
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(amazonBooks)
              };

            case 'search':
              // Handle both array format and comma-separated string format
              let tagsArray: string[] = [];
              if (params.tags) {
                if (Array.isArray(params.tags)) {
                  tagsArray = params.tags;
                } else if (typeof params.tags === 'string') {
                  // Split comma-separated string and trim whitespace
                  tagsArray = params.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                }
              }
              
              const searchResults = await searchBooks({
                tags: tagsArray,
                minRating: params.minRating ? parseFloat(params.minRating) : undefined,
                minPages: params.minPages ? parseInt(params.minPages) : undefined,
                sortBy: params.sortBy as any,
                limit: params.limit ? parseInt(params.limit) : undefined,
                offset: params.offset ? parseInt(params.offset) : undefined,
                query: params.query || undefined,
              });
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(searchResults)
              };

            case 'author':
              const authorName = path[2];
              if (!authorName) {
                return {
                  statusCode: 400,
                  headers,
                  body: JSON.stringify({ error: 'Author name is required' })
                };
              }
              const authorBooks = await getAuthorBooks(authorName);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(authorBooks)
              };

            case 'reviews':
              // Get public reviews for a specific book
              if (path[2]) {
                const bookReviews = await prisma.bookReview.findMany({
                  where: { bookId: path[2] },
                  include: { 
                    user: { select: { firstName: true, lastName: true } },
                    book: true 
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 50
                });
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify(bookReviews)
                };
              }
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Book ID is required' })
              };

            default:
              if (subEndpoint) {
                if (path[2] === 'similar') {
                  const similarLimit = params.limit ? parseInt(params.limit) : 5;
                  const similarBooks = await getSimilarBooks(subEndpoint, similarLimit);
                  return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(similarBooks)
                  };
                }
                
                const book = await fetchBookDetails(subEndpoint);
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify(book)
                };
              }
              
              const page = params.page ? parseInt(params.page) : 1;
              const bookList = await fetchBooks(page);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(bookList)
              };
          }
        } catch (error) {
          console.error('Error in books endpoint:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Error processing books request',
              details: error instanceof Error ? error.message : 'Unknown error',
              path: event.path
            })
          };
        }
        break;

      case 'realms':
        const realmEndpoint = path[1];
        const realmName = path[2];
        
        if (realmEndpoint === 'boss' && realmName) {
          // GET /realms/boss/{realmName} - Get boss data (only if no subpath)
          if (event.httpMethod === 'GET' && !path[3]) {
            let boss = await prisma.realmBoss.findUnique({
              where: { realm: realmName.toUpperCase() as any }
            });
            
            if (!boss) {
              // Create default boss if doesn't exist
              boss = await prisma.realmBoss.create({
                data: {
                  realm: realmName.toUpperCase() as any,
                  name: getBossName(realmName.toUpperCase()),
                  maxHitpoints: 10000,
                  currentHitpoints: 10000 // This will be calculated dynamically
                }
              });
            }

            // Calculate current HP from story entries
            const currentHitpoints = await calculateCurrentHP(boss);
            const totalDamage = boss.maxHitpoints - currentHitpoints;
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                ...boss,
                currentHitpoints,
                totalDamageThisCycle: totalDamage
              })
            };
          }

          // GET /realms/boss/{realmName}/stats - Get battle statistics
          if (event.httpMethod === 'GET' && path[3] === 'stats') {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const boss = await prisma.realmBoss.findUnique({
              where: { realm: realmName.toUpperCase() as any }
            });
            
            if (!boss) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Boss not found' })
              };
            }

            // Get recent battle activities (last 24 hours)
            const recentBattles = await prisma.battleActivity.findMany({
              where: {
                realmBossId: boss.id,
                createdAt: {
                  gte: yesterday
                }
              },
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                },
                book: {
                  select: { title: true }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 10
            });

            // Calculate current HP from story entries
            const currentHp = await calculateCurrentHP(boss);
            const totalDamageThisCycle = boss.maxHitpoints - currentHp;

            // Calculate today's stats
            const totalDamageToday = recentBattles.reduce((sum, battle) => sum + battle.damage, 0);
            const totalMinutesToday = recentBattles.reduce((sum, battle) => sum + battle.minutesRead, 0);
            const uniqueContributors = new Set(recentBattles.filter(b => b.userId).map(b => b.userId)).size;
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                totalDamageToday,
                totalMinutesToday,
                uniqueContributors,
                currentHp,
                maxHp: boss.maxHitpoints,
                totalDamageThisCycle,
                recentBattles: recentBattles.map(battle => ({
                  damage: battle.damage,
                  minutesRead: battle.minutesRead,
                  user: battle.user ? `${battle.user.firstName} ${battle.user.lastName}` : 'Anonymous',
                  book: battle.book?.title || null,
                  createdAt: battle.createdAt
                }))
              })
            };
          }

          // GET /realms/boss/{realmName}/story - Get battle story
          if (event.httpMethod === 'GET' && path[3] === 'story') {
            const boss = await prisma.realmBoss.findUnique({
              where: { realm: realmName.toUpperCase() as any },
              include: {
                storyEntries: {
                  orderBy: { createdAt: 'asc' },
                  take: 100 // Limit to last 100 entries for performance
                }
              }
            });
            
            if (!boss) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Boss not found' })
              };
            }

            // Ensure there's always a boss introduction at the beginning
            const hasIntroduction = boss.storyEntries.some(entry => entry.entryType === 'BOSS_INTRODUCTION');
            
            if (!hasIntroduction) {
              const introContent = generateBossIntroduction(realmName.toUpperCase(), boss.name);
              // Create introduction with a timestamp that ensures it's first
              await prisma.battleStory.create({
                data: {
                  realmBossId: boss.id,
                  entryType: 'BOSS_INTRODUCTION',
                  content: introContent,
                  metadata: {
                    bossName: boss.name,
                    realm: realmName.toUpperCase(),
                    maxHp: boss.maxHitpoints
                  },
                  // Set created time to be before any existing entries
                  createdAt: boss.storyEntries.length > 0 
                    ? new Date(Math.min(...boss.storyEntries.map(e => new Date(e.createdAt).getTime())) - 1000)
                    : new Date()
                }
              });
              
              // Fetch again with the new introduction
              const updatedBoss = await prisma.realmBoss.findUnique({
                where: { realm: realmName.toUpperCase() as any },
                include: {
                  storyEntries: {
                    orderBy: { createdAt: 'asc' }
                  }
                }
              });
              
              // Calculate current HP for the updated boss
              const currentHp = await calculateCurrentHP(updatedBoss!);

              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  boss: {
                    name: updatedBoss!.name,
                    currentHp: currentHp,
                    maxHp: updatedBoss!.maxHitpoints,
                    realm: realmName.toUpperCase()
                  },
                  story: updatedBoss!.storyEntries
                })
              };
            }
            
            // Calculate current HP for the existing boss
            const currentHp = await calculateCurrentHP(boss);

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                boss: {
                  name: boss.name,
                  currentHp: currentHp,
                  maxHp: boss.maxHitpoints,
                  realm: realmName.toUpperCase()
                },
                story: boss.storyEntries
              })
            };
          }
          
          // POST /realms/boss/{realmName}/battle - Battle the boss
          if (event.httpMethod === 'POST' && path[3] === 'battle') {
            const battleData = JSON.parse(event.body || '{}');
            const { minutesRead, bookId, userId } = battleData;
            
            if (!minutesRead || minutesRead <= 0) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Minutes read must be greater than 0' })
              };
            }

            if (minutesRead > 300) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Maximum 300 minutes per battle session' })
              };
            }

            // Check daily limit for users (500 minutes per 24 hours)
            if (userId) {
              const now = new Date();
              const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              
              const todaysBattles = await prisma.battleActivity.findMany({
                where: {
                  userId: userId,
                  createdAt: {
                    gte: yesterday
                  }
                }
              });
              
              const todaysMinutes = todaysBattles.reduce((sum, battle) => sum + battle.minutesRead, 0);
              
              if (todaysMinutes + minutesRead > 500) {
                const remainingMinutes = Math.max(0, 500 - todaysMinutes);
                return {
                  statusCode: 400,
                  headers,
                  body: JSON.stringify({ 
                    error: `Daily limit exceeded. You have ${remainingMinutes} minutes remaining today.`,
                    remainingMinutes
                  })
                };
              }
            }
            
            // Get or create boss
            let boss = await prisma.realmBoss.findUnique({
              where: { realm: realmName.toUpperCase() as any }
            });
            
            if (!boss) {
              boss = await prisma.realmBoss.create({
                data: {
                  realm: realmName.toUpperCase() as any,
                  name: getBossName(realmName.toUpperCase()),
                  maxHitpoints: 10000,
                  currentHitpoints: 10000
                }
              });
            }

            // Calculate current HP from story entries
            const currentHp = await calculateCurrentHP(boss);
            
            // Calculate damage (1 minute = 1 damage)
            const damage = Math.min(minutesRead, currentHp);
            
            // Create battle activity record
            const battleActivity = await prisma.battleActivity.create({
              data: {
                realmBossId: boss.id,
                userId: userId || null,
                minutesRead,
                bookId: bookId || null,
                damage
              },
              include: {
                user: true,
                book: true
              }
            });
            
            // Generate battle story entry
            const userName = battleActivity.user ? 
              `${battleActivity.user.firstName} ${battleActivity.user.lastName}` : 
              'Anonymous Hero';
            const bookTitle = battleActivity.book?.title;
            
            const storyContent = generateBattleAction(
              realmName.toUpperCase(), 
              userName, 
              damage, 
              bookTitle
            );
            
            await addStoryEntry(boss.id, 'BATTLE_ACTION', storyContent, {
              userId: userId || null,
              userName,
              damage,
              minutesRead,
              bookTitle: bookTitle || null,
              bossHpBefore: currentHp,
              bossHpAfter: Math.max(0, currentHp - damage)
            });
            
            // Calculate new HP after this battle
            const newHp = Math.max(0, currentHp - damage);
            
            // If boss is defeated, respawn with full HP after a short delay
            const shouldRespawn = currentHp > 0 && newHp <= 0;
            
            if (shouldRespawn) {
              // Add defeat story entry
              const defeatContent = realmName.toUpperCase() === 'XIANXIA' ? 
                `🏆 ${boss.name} roars in acknowledgment! "Impressive, mortals! Your combined reading cultivation has earned my respect. But do not grow complacent... I shall return stronger!" The dragon's form dissolves into golden light, only to reform moments later with renewed power.` :
                realmName.toUpperCase() === 'GAMELIT' ?
                `💀 SYSTEM MESSAGE: BOSS DEFEATED! ${boss.name} fragmentes into data particles. "RESPAWN PROTOCOL INITIATED... DIFFICULTY INCREASED... PATCH NOTES: Players too strong, buffing boss AI..." Reality reconstructs as the boss returns with updated parameters.` :
                realmName.toUpperCase() === 'APOCALYPSE' ?
                `☠️ ${boss.name} falls to one knee, his reality-dungeon crumbling! "Well fought, survivors. You have passed this trial. But the wasteland is eternal, and so am I..." His form disperses into shadows before reforming with renewed determination.` :
                `⚡ ${boss.name} smiles as his forms across dimensions fade! "Death is but another doorway for one such as I. Your reading has strengthened your souls admirably..." Space-time ripples as he reincarnates instantly, ready for the next cycle.`;
              
              await addStoryEntry(boss.id, 'BOSS_DEFEAT', defeatContent, {
                defeatedAt: new Date(),
                totalDamageDealt: boss.maxHitpoints,
                respawning: true
              });
            }
            
            // Calculate HP for percentage checks (no need to update database)
            const finalHp = shouldRespawn ? boss.maxHitpoints : newHp;

            // Check for milestones and add story entries
            const hpPercentage = (finalHp / boss.maxHitpoints) * 100;
            if (hpPercentage <= 75 && hpPercentage > 50) {
              // Check if we haven't already logged this milestone
              const existingMilestone = await prisma.battleStory.findFirst({
                where: {
                  realmBossId: boss.id,
                  entryType: 'MILESTONE',
                  metadata: {
                    path: ['milestone'],
                    equals: '75percent'
                  }
                }
              });
              
              if (!existingMilestone) {
                const milestoneContent = generateMilestone(realmName.toUpperCase(), "Boss health drops below 75%! The tide of battle turns!");
                await addStoryEntry(boss.id, 'MILESTONE', milestoneContent, { milestone: '75percent' });
              }
            } else if (hpPercentage <= 50 && hpPercentage > 25) {
              const existingMilestone = await prisma.battleStory.findFirst({
                where: {
                  realmBossId: boss.id,
                  entryType: 'MILESTONE',
                  metadata: {
                    path: ['milestone'],
                    equals: '50percent'
                  }
                }
              });
              
              if (!existingMilestone) {
                const milestoneContent = generateMilestone(realmName.toUpperCase(), "Boss health drops to half! Victory is within reach!");
                await addStoryEntry(boss.id, 'MILESTONE', milestoneContent, { milestone: '50percent' });
              }
            } else if (hpPercentage <= 25 && hpPercentage > 0) {
              const existingMilestone = await prisma.battleStory.findFirst({
                where: {
                  realmBossId: boss.id,
                  entryType: 'MILESTONE',
                  metadata: {
                    path: ['milestone'],
                    equals: '25percent'
                  }
                }
              });
              
              if (!existingMilestone) {
                const milestoneContent = generateMilestone(realmName.toUpperCase(), "Boss on the brink of defeat! One final push!");
                await addStoryEntry(boss.id, 'MILESTONE', milestoneContent, { milestone: '25percent' });
              }
            }
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                boss: {
                  ...boss,
                  currentHitpoints: finalHp
                },
                damage,
                defeated: shouldRespawn
              })
            };
          }
        }

        // GET /realms/user/{userId}/daily-minutes - Get user's remaining daily minutes
        if (realmEndpoint === 'user' && realmName && path[3] === 'daily-minutes') {
          const userId = realmName;
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          const todaysBattles = await prisma.battleActivity.findMany({
            where: {
              userId: userId,
              createdAt: {
                gte: yesterday
              }
            }
          });
          
          const todaysMinutes = todaysBattles.reduce((sum, battle) => sum + battle.minutesRead, 0);
          const remainingMinutes = Math.max(0, 500 - todaysMinutes);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              usedMinutes: todaysMinutes,
              remainingMinutes,
              dailyLimit: 500
            })
          };
        }
        
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Realm endpoint not found' })
        };

      default:
        console.log('No matching endpoint found for:', endpoint);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Endpoint not found', 
            path: event.path, 
            cleanPath,
            segments: path 
          })
        };
    }
  } catch (error) {
    console.error('Error in API function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        path: event.path
      })
    };
  } finally {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  }
}; 