import { Notification } from "./notification.model";
import { NotificationStatus } from "../../common/constants/notificationStatus";
import { sendNotification } from "./notification.service";
import { NotFoundError } from "../../common/errors";

interface GetAlertsOptions {
  module?: "school" | "gym" | "barber";
  status?: NotificationStatus;
  read?: boolean;
  page?: number;
  limit?: number;
}

export const getAlerts = async (
  workspaceId: string,
  options: GetAlertsOptions = {}
) => {
  const { module, status, read, page = 1, limit = 20 } = options;

  const filter: Record<string, unknown> = { workspaceId };
  if (module) filter.module = module;
  if (status) filter.status = status;
  if (read !== undefined) filter.read = read;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadCount = async (workspaceId: string) => {
  return Notification.countDocuments({ workspaceId, read: false });
};

export const markAlertRead = async (workspaceId: string, alertId: string) => {
  const alert = await Notification.findOneAndUpdate(
    { _id: alertId, workspaceId },
    { read: true },
    { new: true }
  );
  if (!alert) throw new NotFoundError("Alert not found");
  return alert;
};

export const markAllAlertsRead = async (workspaceId: string) => {
  await Notification.updateMany({ workspaceId, read: false }, { read: true });
};

export const retryAlert = async (workspaceId: string, alertId: string) => {
  const alert = await Notification.findOne({ _id: alertId, workspaceId });
  if (!alert) throw new NotFoundError("Alert not found");

  if (alert.status === NotificationStatus.SENT) {
    return alert; // Already sent, nothing to retry
  }

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
  } else {
    alert.status = NotificationStatus.FAILED;
  }

  return alert.save();
};

