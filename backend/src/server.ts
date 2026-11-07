import app from "./app";
import { connectDB } from "./database/connection";
import { env } from "./config/env";
import { scheduleOverdueInvoicesJob } from "./jobs/markOverdueInvoices.job";
import { scheduleExpiringMembershipsJob } from "./jobs/markExpiringMemberships.job";
import { schedulePendingAlertsJob } from "./jobs/sendPendingAlerts.job";

const startServer = async () => {
  await connectDB();
  scheduleOverdueInvoicesJob();
  scheduleExpiringMembershipsJob();
  schedulePendingAlertsJob();
  app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
};

startServer();