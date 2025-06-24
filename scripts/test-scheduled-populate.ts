import { DatabasePopulator } from "../lib/database-populator";

async function testScheduledPopulate() {
  try {
    console.log("Starting test of scheduled database population...");

    const populator = new DatabasePopulator();
    
    // Test with reduced pages for faster testing
    const result = await populator.populateDatabase({
      maxPages: 2,
      minFollowers: 50,
    });

    console.log("Test completed!", result);
  } catch (error) {
    console.error("Error in test:", error);
  }
}

// Run the test
testScheduledPopulate(); 