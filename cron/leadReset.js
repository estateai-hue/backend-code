import cron from "node-cron";
import Company from "../models/Company.js";

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily lead reset...");

  await Company.updateMany(
    { "plan.name": "standard" },
    { $set: { leadsUsed: 0 } }
  );
});
