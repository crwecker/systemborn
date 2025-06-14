import { prisma } from "../lib/prisma";

// Affiliate links data from Books.tsx (exactly as they appear in the file)
const AFFILIATE_LINKS = [
  {
    id: `asin-B09M2R6QLF`,
    title: `Mother of Learning: ARC 1`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `nobody103`,
        linkToContributor: `https://www.amazon.com/stores/nobody103/author/B09M91FQ27?isDramIntegrated=true&shoppingPortalEnabled=true&ccs_id=7aa95fc6-9714-4c4a-b3c1-14cc71c399fb&linkCode=ll2&tag=litrpgacademy-20&linkId=125f0624c24a7ed0b70701c505f6fab5&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/4jvc6gb`,
    poster: `https://m.media-amazon.com/images/I/81NXjG0TyuL._SY522_.jpg`,
    description: `Zorian Kazinski has all the time in the world to get stronger, and he plans on taking full advantage of it.

A teenage mage of humble birth and slightly above-average skill, Zorian is attending his third year of education at Cyoria's magical academy. A driven and quiet young man, he is consumed by a desire to ensure his own future and free himself of the influence of his family, resenting the Kazinskis for favoring his brothers over him. Consequently, Zorian has no time for pointless distractions, much less other people's problems.

As it happens, though, time is something he is about to get plenty of.

On the eve of Cyoria's annual summer festival, Zorian is murdered, then abruptly brought back to the beginning of the month, just before he was about to take the train to school. Finding himself trapped in a time loop with no clear end or exit, he will have to look both within and without to unravel the mystery set before him. He does have to unravel it, too, because the loop clearly wasn't made for his sake, and in a world of magic even a time traveler isn't safe from those who wish him ill.

Fortunately for Zorian, repetition is the mother of learning…`,
    review: `Great story. Listened to it on a road trip and my teenagers loved it. Such a good time loop story. I love how the world unfolds and mysteries are revealed.`,
  },
  {
    id: `asin-B08KGT4CLQ`,
    title: `Iron Prince (Warformed: Stormweaver Book 1)`,
    authors: [
      {
        contributorType: `AUTHOR`,
        name: `Bryce O'Connor`,
        linkToContributor: `https://www.amazon.com/stores/Bryce-OConnor/author/B019A75WZG?ccs_id=c1714be2-51b4-4c81-a1ff-f22b6d164b02&linkCode=ll2&tag=litrpgacademy-20&linkId=d7059941a18f7b2b1ad62a8f501414ed&language=en_US&ref_=as_li_ss_tl`,
      },
      {
        contributorType: `AUTHOR`,
        name: `Luke Chmilenko`,
        linkToContributor: `https://www.amazon.com/stores/Luke-Chmilenko/author/B01LZ2769R?ccs_id=5a94c80b-deba-44cf-821e-1e28e861b5e1&linkCode=ll2&tag=litrpgacademy-20&linkId=4691ba1a438e2b2566b007078b2129a2&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/45El8Ep`,
    poster: `https://m.media-amazon.com/images/I/81GLx+EaP2L._SY522_.jpg`,
    description: `Reidon Ward will become a god.

He doesn't know it yet, of course. Reidon was born weak, sickly and small. Afflicted with a painful disease and abandoned by his parents because of it, he has had to fight tooth and nail for every minor advantage life has allowed him.

His perseverance has not gone unnoticed, however, and when the most powerful artificial intelligence in human history takes an interest in him, things began to change quickly. Granted a CAD—a Combat Assistance Device—with awful specs but an infinite potential for growth, Reidon finds himself at the bottom of his class at the Galens Institute, one of the top military academies in the Collective. Along with his best friend, Viviana Arada, Reidon will have to start his long climb through the school rankings, and on to the combat tournament circuits that have become humanity's greatest source of excitement and entertainment.

So begins the rise of a god. So begins the ascent of the Stormweaver.`,
    review: `My teenager's read this book over and over. More sci-fi than litrpg, but it is such an awesome underdog story.`,
  },
  {
    id: `asin-B0BFMB1X6Y`,
    title: `Ritualist: An Epic Fantasy LitRPG Adventure (The Completionist Chronicles Book 1)`,
    author: `Dakota Krout`,
    author_url: ``,
    affiliate_link: `https://amzn.to/3FEfs2L`,
    poster: `https://m.media-amazon.com/images/I/51prG6HjRRL._SY445_SX342_PQ35_.jpg`,
    description: `A game that puts all others to shame. Magic that has been banned from the world. A man willing to learn no matter the cost.

The decision to start a new life is never an easy one, but for Joe the transition was far from figurative. Becoming a permanent addition to a game world, it doesn't take long to learn that people with his abilities are actively hunted. In fact, if the wrong people gained knowledge of what he was capable of, assassins would appear in droves.

In his pursuit of power, Joe fights alongside his team, completes quests, and delves into the mysteries of his class, which he quickly discovers can only be practiced in secret. Ultimately, his goal is to complete every mission, master every ability, and learn all of the world's secrets.

All he has to do is survive long enough to make that happen.`,
    review: `One of the first litrpg books I listened to with my family. It had us laughing out loud. Great characters.`,
  },
  {
    id: `asin-B0CVD8D7H6`,
    title: `Heretical Fishing: A Cozy Guide to Annoying the Cults, Outsmarting the Fish, and Alienating Oneself`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `Haylock Jobson`,
        linkToContributor: `https://www.amazon.com/stores/Haylock-Jobson/author/B0CVGY4Y77?isDramIntegrated=true&shoppingPortalEnabled=true&ccs_id=c6ae39d9-a417-4396-8852-d779560148c2&linkCode=ll2&tag=litrpgacademy-20&linkId=2a5dd07493c9b8368e5628602fd7a680&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/45DK8vq`,
    poster: `https://m.media-amazon.com/images/I/41qt6S2ttZL._SY445_SX342_PQ35_.jpg`,
    description: `A world abandoned by the gods, mystifying cosmic forces, unimaginable power for those willing to ascend, and a hero who would rather . . . go fishing???

When summoned to a fantastical world and granted powers by a broken System, most freshly minted protagonists would strap on their big-boy boots and get ready for their stats to start climbing. But Fischer isn'tlike most MCs. In fact, he doesn't want to be a hero at all.

Fame? Fortune? Power? He had enough of all that in his old life. Discovering forbidden fishing techniques and petting every cute animal that comes within scritching distance? Now that's a good time.

Unfortunately for Fischer, cosmic forces rarely care for mortal feelings. He's hounded on all sides by inept cults, conspiring nobles, and more magical misunderstandings than those of a preteen relationship. Even his dutiful pet crab is firing energy blades like an anime antagonist.

So grab your fishing rod and a good snack, and pet your dog for me. The catch of a lifetime awaits!

The first volume of the laugh-out-loud LitRPG adventure series—a #1 Rising Star on Royal Road with more than three million views—now available on Kindle, Kindle Unlimited, and Audible!

"I can't think of a single story I'd rather get truck-kun'd (truck-kunned?) into than [that of] the vivid, lush world portrayed in Heretical Fishing, especially if I can hang out with Fischer and his gang. . . . The best book I've read this year." —Matt Dinniman, author of Dungeon Crawler Carl`,
    review: `I've read (listened to) this one a few times. It is very cozy. Great characters and really makes you want to go fishing!`,
  },
  {
    id: `asin-B09Y6RQSHM`,
    title: `Beware of Chicken: A Xianxia Cultivation Novel`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `Casualfarmer`,
        linkToContributor: `https://www.amazon.com/stores/Casualfarmer/author/B0B23WCPKJ?isDramIntegrated=true&shoppingPortalEnabled=true&ccs_id=ec4a20e5-165d-474f-b740-1a9d220c0508&linkCode=ll2&tag=litrpgacademy-20&linkId=7b0b8aef9bd1c90af1add3bcc136989a&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/43Afbpi`,
    poster: `https://m.media-amazon.com/images/I/512HZqVOzeL._SY445_SX342_PQ35_.jpg`,
    description: `A laugh-out-loud, slice-of-life martial-arts fantasy about . . . farming????

Jin Rou wanted to be a cultivator. A man powerful enough to defy the heavens. A master of martial arts. A lord of spiritual power. Unfortunately for him, he died, and now I'm stuck in his body.

Arrogant Masters? Heavenly Tribulations? All that violence and bloodshed? Yeah, no thanks. I'm getting out of here.

Farm life sounds pretty great. Tilling a field by hand is fun when you've got the strength of ten men—though maybe I shouldn't have fed those Spirit Herbs to my pet rooster. I'm not used to seeing a chicken move with such grace . . . but Qi makes everything kind of wonky, so it's probably fine.

Instead of a lifetime of battle, my biggest concerns are building a house, the size of my harvest, and the way the girl from the nearby village glares at me when I tease her.

A slow, simple, fulfilling life in a place where nothing exciting or out of the ordinary ever happens . . . right?

The first volume of the blockbuster progression-fantasy series—with more than 20 million views on Royal Road—now available in paperback, ebook, and audiobook!`,
    review: `Also super cozy. I got my 70 year old parents to listen to this one and they loved it.`,
  },
  {
    id: `asin-B07G4MX1Z4`,
    title: `The Wandering Inn: Book One in The Wandering Inn Series`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `pirate aba`,
        linkToContributor: `https://www.amazon.com/stores/pirate-aba/author/B07XCYVYMW?ccs_id=e6372c96-6bc9-4f52-a21d-479aed9cefe7&linkCode=ll2&tag=litrpgacademy-20&linkId=55448ae5b56a83e8c38da821233658c5&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/4jzfKFZ`,
    poster: `https://m.media-amazon.com/images/I/41zGUBv9XHL._SY445_SX342_PQ35_.jpg`,
    description: `(This novel is the e-book version of the free web serial. You may read the entire ongoing story at wanderinginn.com free of charge.)

"No killing Goblins."

So reads the sign outside of The Wandering Inn, a small building run by a young woman named Erin Solstice. She serves pasta with sausage, blue fruit juice, and dead acid flies on request. And she comes from another world. Ours.

It's a bad day when Erin finds herself transported to a fantastical world and nearly gets eaten by a Dragon. She doesn't belong in a place where monster attacks are a fact of life, and where Humans are one species among many. But she must adapt to her new life. Or die.

In a dangerous world where magic is real and people can level up and gain classes, Erin Solstice must battle somewhat evil Goblins, deadly Rock Crabs, and hungry [Necromancers]. She is no warrior, no mage. Erin Solstice runs an inn. She's an [Innkeeper].`,
    review: `Great story. Very epic. Lots of fun and unique characters. The story is super duper long and still going strong.`,
  },
  {
    id: `asin-B08BKGYQXW`,
    title: `Dungeon Crawler Carl: Dungeon Crawler Carl Book 1`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `Matt Dinniman`,
        linkToContributor: `https://www.amazon.com/stores/Matt-Dinniman/author/B002BLP1QY?ccs_id=8a36f884-0fd7-4580-9f54-7fe448735146&linkCode=ll2&tag=litrpgacademy-20&linkId=293fa6dd5d7534bf82af637f18271efb&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/3SA9faY`,
    poster: `https://m.media-amazon.com/images/I/81XbhUrUsBL._SY522_.jpg`,
    description: `The apocalypse will be televised!
You know what's worse than breaking up with your girlfriend? Being stuck with her prize-winning show cat. And you know what's worse than that? An alien invasion, the destruction of all man-made structures on Earth, and the systematic exploitation of all the survivors for a sadistic intergalactic game show. That's what.

Join Coast Guard vet Carl and his ex-girlfriend's cat, Princess Donut, as they try to survive the end of the world—or just get to the next level—in a video game–like, trap-filled fantasy dungeon. A dungeon that's actually the set of a reality television show with countless viewers across the galaxy. Exploding goblins. Magical potions. Deadly, drug-dealing llamas. This ain't your ordinary game show.

Welcome, Crawler. Welcome to the Dungeon. Survival is optional. Keeping the viewers entertained is not.`,
    review: `It's been a while since I've read this (pretty sure book 4 had just come out). Great characters and so fun as you learn more and more about the world Carl is thrust into.`,
  },
  {
    id: `asin-B01H1CYBS6`,
    title: `Unsouled (Cradle Book 1)`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `Will Wight`,
        linkToContributor: `https://www.amazon.com/stores/Will-Wight/author/B00D9S1IMO?ccs_id=2372ed37-dc1b-4a3c-86a6-36bd626fd407&linkCode=ll2&tag=litrpgacademy-20&linkId=80b46c566ed5921f8a8565ee241670e8&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/3ZfgFnT`,
    poster: `https://m.media-amazon.com/images/I/513JnJQpruL._SY445_SX342_PQ35_.jpg`,
    description: `The first book in the New York Times bestselling Cradle series!

Lindon is born Unsouled, the one person in his family unable to use the magical Paths of the sacred arts. He uses every trick and technique he can borrow or steal to improve his life, but it seems he will never be able to join the ranks of the truly powerful.

Until the heavens descend and show him the future.

When Lindon becomes the only one who sees the approaching doom, he must leave his homeland to save it... and to see how far he can go by walking his own Path.

Cradle is now complete! This 12-book series begins here with Unsouled and concludes with Waybound.`,
    review: `Super fun read. Great progression. The unfolding of each new cultivation level opens up the world (and universe) a bit more so it keeps you on your toes. `,
  },
  {
    id: `asin-B08WCT9W26`,
    title: `He Who Fights with Monsters: A LitRPG Adventure`,
    contributors: [
      {
        contributorType: `AUTHOR`,
        name: `Shirtaloon`,
        linkToContributor: `https://www.amazon.com/stores/Shirtaloon/author/B08VWFRTMS?isDramIntegrated=true&shoppingPortalEnabled=true&ccs_id=98b4f95b-0060-409d-a87d-98e91d0ec904&linkCode=ll2&tag=litrpgacademy-20&linkId=7c9ef0b913a81e9d88706ca7c369ef56&language=en_US&ref_=as_li_ss_tl`,
      },
    ],
    affiliate_link: `https://amzn.to/43q5Bqm`,
    poster: `https://m.media-amazon.com/images/I/51l0a6bIDQL._SY445_SX342_PQ35_.jpg`,
    description: `Jason wakes up in a mysterious world of magic and monsters.

It's not easy making the career jump from office-supplies-store middle manager to heroic interdimensional adventurer. At least, Jason tries to be heroic, but it's hard to be good when all your powers are evil.

He'll face off against cannibals, cultists, wizards, monsters...and that's just on the first day. He's going to need courage, he's going to need wit, and he's going to need some magic powers of his own. But first, he's going to need pants.

After cementing itself as one of the best-rated serial novels on Royal Road with an astonishing 13 million views, He Who Fights with Monsters is now available on Kindle.

About the series: Experience an isekai culture clash as a laid-back Australian finds himself in a very serious world. See him gain suspiciously evil powers through a unique progression system combining cultivation and traditional LitRPG elements. Enjoy a weak-to-strong story with a main character who earns his power without overshadowing everyone around him, with plenty of loot, adventurers, gods and magic. Rich characters and world-building offer humor, political intrigue and slice-of-life elements alongside lots of monster fighting and adventure.`,
    review: `Classic litrpg. Great world building and great characters.`,
  },
];

const USER_ID = 'cmbjdfr1c0000kyu3giis7lz2';

// Helper function to normalize contributors from different data structures
function getContributors(book: any): Array<{contributorType: string, name: string, linkToContributor?: string}> {
  // Handle 'contributors' field
  if (book.contributors) {
    return book.contributors;
  }
  
  // Handle 'authors' field  
  if (book.authors) {
    return book.authors;
  }
  
  // Handle single 'author' field
  if (book.author) {
    return [{
      contributorType: 'AUTHOR',
      name: book.author,
      linkToContributor: book.author_url || ''
    }];
  }
  
  return [];
}

// Helper function to get the source URL
function getSourceUrl(book: any): string {
  return book.affiliate_link || book.source_url || '';
}

async function populateAffiliateLinks() {
  try {
    console.log("Starting affiliate links population...");

    for (const book of AFFILIATE_LINKS) {
      console.log(`Processing book: ${book.title}`);

      // Get contributors using the helper function
      const contributors = getContributors(book);
      
      // Extract the first author name for the authorName field (required field)
      const primaryAuthor = contributors.find(c => c.contributorType === 'AUTHOR');
      const authorName = primaryAuthor ? primaryAuthor.name : 'Unknown Author';

      // Create or update the book
      const bookData = {
        id: book.id,
        title: book.title,
        authorName: authorName,
        description: book.description,
        tags: ['LitRPG'], // Default tags for affiliate books
        coverUrl: book.poster,
        sourceUrl: getSourceUrl(book),
        source: 'AMAZON' as const,
        contentWarnings: [],
      };

      await prisma.book.upsert({
        where: { id: book.id },
        update: bookData,
        create: bookData,
      });

      console.log(`Created/updated book: ${book.title}`);

      // Process contributors
      for (const contributorData of contributors) {
        if (!contributorData.name) continue;

        // Create or get contributor - first try to find existing, then create if not found
        let contributor = await prisma.contributor.findFirst({
          where: { name: contributorData.name },
        });

        if (!contributor) {
          contributor = await prisma.contributor.create({
            data: {
              name: contributorData.name,
              linkToContributor: contributorData.linkToContributor || null,
            },
          });
        } else {
          // Update existing contributor if link changed
          if (contributorData.linkToContributor && contributor.linkToContributor !== contributorData.linkToContributor) {
            contributor = await prisma.contributor.update({
              where: { id: contributor.id },
              data: {
                linkToContributor: contributorData.linkToContributor,
              },
            });
          }
        }

        console.log(`Created/updated contributor: ${contributorData.name}`);

        // Create book-contributor relationship
        await prisma.bookContributor.upsert({
          where: {
            bookId_contributorId_contributorType: {
              bookId: book.id,
              contributorId: contributor.id,
              contributorType: contributorData.contributorType as any,
            },
          },
          update: {},
          create: {
            bookId: book.id,
            contributorId: contributor.id,
            contributorType: contributorData.contributorType as any,
          },
        });

        console.log(`Created book-contributor relationship for: ${book.title} - ${contributorData.name}`);
      }

      // Create book review
      await prisma.bookReview.upsert({
        where: {
          userId_bookId: {
            userId: USER_ID,
            bookId: book.id,
          },
        },
        update: {
          review: book.review,
        },
        create: {
          userId: USER_ID,
          bookId: book.id,
          review: book.review,
        },
      });

      console.log(`Created/updated review for: ${book.title}`);
    }

    console.log("Affiliate links population completed!");
  } catch (error) {
    console.error("Error populating affiliate links:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateAffiliateLinks(); 