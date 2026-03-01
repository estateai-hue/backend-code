import cron from "node-cron";
import Lead from "../models/Lead.js";

export const startFollowUpCron = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Running overdue check...");

    await Lead.updateMany(
      {
        followUpDate: { $lt: new Date() },
        status: { $ne: "closed" }
      },
      {
        $set: { status: "overdue" }
      }
    );
  });
};