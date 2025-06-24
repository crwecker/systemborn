import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { DatabasePopulator } from "../../lib/database-populator";

// Initialize Prisma with better error handling
let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  throw error;
}

export const handler: Handler = async (event, context) => {
  // For local testing, allow manual invocation
  const isLocalTest = process.env.NODE_ENV === 'development' || !(event as any).source;
  
  if (!isLocalTest && (event as any).source !== "aws.events") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "This function should only be called by scheduled events" }),
    };
  }

  try {
    console.log("Starting scheduled database population...");

    const populator = new DatabasePopulator(prisma);
    
    // Run with full configuration for production
    const result = await populator.populateDatabase({
      maxPages: 5,
      minFollowers: 50,
    });

    console.log(`Scheduled database population completed!`, result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Database population completed successfully",
        ...result,
      }),
    };
  } catch (error) {
    console.error("Error in scheduled database population:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Database population failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  }
}; 