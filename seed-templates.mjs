import { seedTemplates } from "./server/templateDb.ts";

seedTemplates()
  .then(() => {
    console.log("✅ Templates seeded successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding templates:", err);
    process.exit(1);
  });
