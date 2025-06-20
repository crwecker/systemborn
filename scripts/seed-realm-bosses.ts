import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REALM_BOSSES = [
  {
    realm: 'XIANXIA',
    name: 'Longzu, The Heaven-Scourging Flame',
    maxHitpoints: 10000,
    currentHitpoints: 10000
  },
  {
    realm: 'GAMELIT',
    name: 'Glitchlord Exeon',
    maxHitpoints: 10000,
    currentHitpoints: 10000
  },
  {
    realm: 'APOCALYPSE',
    name: 'Zereth, Dungeon Architect of the End',
    maxHitpoints: 10000,
    currentHitpoints: 10000
  },
  {
    realm: 'ISEKAI',
    name: 'Aurelion the Eternal Return',
    maxHitpoints: 10000,
    currentHitpoints: 10000
  }
]

async function seedRealmBosses() {
  console.log('Seeding realm bosses...')
  
  for (const bossData of REALM_BOSSES) {
    try {
      const boss = await prisma.realmBoss.upsert({
        where: { realm: bossData.realm as any },
        update: {
          name: bossData.name,
          maxHitpoints: bossData.maxHitpoints,
          currentHitpoints: bossData.currentHitpoints
        },
        create: bossData as any
      })
      console.log(`✅ ${bossData.realm} boss created/updated:`, boss.name)
    } catch (error) {
      console.error(`❌ Error creating ${bossData.realm} boss:`, error)
    }
  }
  
  console.log('Realm boss seeding completed!')
}

seedRealmBosses()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 