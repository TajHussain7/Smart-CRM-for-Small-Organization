import { NotificationPayload, NotificationResult } from "./notification.types";

/**
 * Mock notification provider — logs to console, returns success.
 * Used in development or when NOTIFICATION_PROVIDER=mock
 */
export const sendMockNotification = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  console.log(
    `[MockNotification] ${payload.channel} → ${payload.to} | Type: ${payload.type} | Recipient: ${payload.recipientName}`
  );
  console.log(`[MockNotification] Message: ${payload.message}`);
  console.log(`[MockNotification] MessageId: ${messageId}`);

  return { success: true, messageId };
};

