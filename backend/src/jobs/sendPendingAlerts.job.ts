import cron from "node-cron";
import { Notification } from "../modules/notifications/notification.model";
import {
  NotificationStatus,
  MAX_RETRY_COUNT,
} from "../common/constants/notificationStatus";
import { sendNotification } from "../modules/notifications/notification.service";

export const sendPendingAlertsJob = async () => {
  const pendingAlerts = await Notification.find({
    status: NotificationStatus.PENDING,
    retryCount: { $lt: MAX_RETRY_COUNT },
  })
    .sort({ createdAt: 1 })
    .limit(50);

  if (pendingAlerts.length === 0) return;

  console.log(`[Alerts Job] Processing ${pendingAlerts.length} pending alerts`);

  for (const alert of pendingAlerts) {
    try {
      const result = await sendNotification({
        to: alert.contact,
        channel: alert.channel,
        type: alert.type,
        message: alert.message,
        recipientName: alert.recipient,
      });

      alert.retryCount += 1;
      if (result.success) {
        alert.status = NotificationStatus.SENT;
      } else if (alert.retryCount >= MAX_RETRY_COUNT) {
        alert.status = NotificationStatus.FAILED;
      }
      await alert.save();
    } catch (err) {
      alert.retryCount += 1;
      if (alert.retryCount >= MAX_RETRY_COUNT) {
        alert.status = NotificationStatus.FAILED;
      }
      await alert.save();
    }
  }
};

export const schedulePendingAlertsJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await sendPendingAlertsJob();
    } catch (error) {
      console.error("[Alerts Job] Failed:", error);
    }
  });

  console.log("Pending alerts job scheduled (runs every 5 minutes)");
};

