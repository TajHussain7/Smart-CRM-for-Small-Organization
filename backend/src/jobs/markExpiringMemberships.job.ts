import cron from "node-cron";
import { Member } from "../modules/gym/members/member.model";
import { Notification } from "../modules/notifications/notification.model";
import { NotificationType } from "../common/constants/notificationType";
import { NotificationChannel } from "../common/constants/notificationChannel";
import { NotificationStatus } from "../common/constants/notificationStatus";
import { EXPIRING_SOON_THRESHOLD_DAYS } from "../common/constants/membershipStatus";

export const markExpiringMembershipsJob = async () => {
  const now = new Date();
  const threshold = new Date(
    now.getTime() + EXPIRING_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  );

  const expiringMembers = await Member.find({
    expiryDate: { $gte: now, $lte: threshold },
  });

  let queuedCount = 0;
  for (const member of expiringMembers) {
    const expiryStr = member.expiryDate.toISOString().split("T")[0];
    const eventId = `expiring:${member._id.toString()}:${expiryStr}`;

    const res = await Notification.findOneAndUpdate(
      { eventId },
      {
        workspaceId: member.workspaceId,
        module: "gym",
        eventId,
        type: NotificationType.MEMBERSHIP_REMINDER,
        recipient: member.name,
        contact: member.phone,
        message: `Dear ${member.name}, your gym membership (${member.plan}) will expire on ${expiryStr}. Please renew to continue your training without interruption.`,
        channel: NotificationChannel.WHATSAPP,
        status: NotificationStatus.PENDING,
      },
      { upsert: true, new: true }
    );

    if (res) queuedCount++;
  }

  console.log(
    `[Expiring Memberships Job] Processed ${expiringMembers.length} members, queued/updated ${queuedCount} alerts`
  );
};

export const scheduleExpiringMembershipsJob = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      await markExpiringMembershipsJob();
    } catch (error) {
      console.error("[Expiring Memberships Job] Failed:", error);
    }
  });

  console.log("Expiring memberships job scheduled (runs daily at 08:00)");
};

