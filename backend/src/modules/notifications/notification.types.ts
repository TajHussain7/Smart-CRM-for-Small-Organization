import { NotificationChannel } from "../../common/constants/notificationChannel";
import { NotificationType } from "../../common/constants/notificationType";

export interface NotificationPayload {
  to: string; // phone number or email
  channel: NotificationChannel;
  type: NotificationType;
  message: string;
  recipientName: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

