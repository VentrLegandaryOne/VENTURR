import { getDb } from "../server/db.js";
import { quotes, verifications, reports } from "../drizzle/schema.js";

async function clearQuotes() {
  try {
    const db = await getDb();
    
    console.log("Clearing existing quotes data...");
    
    // Delete in reverse order due to foreign key constraints
    await db.delete(reports);
    console.log("✓ Cleared reports");
    
    await db.delete(verifications);
    console.log("✓ Cleared verifications");
    
    await db.delete(quotes);
    console.log("✓ Cleared quotes");
    
    console.log("\n✅ All quote data cleared successfully!");
  } catch (error) {
    console.error("Error clearing quotes:", error);
  }
}

clearQuotes();
