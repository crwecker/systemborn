import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 