import { NotificationChannel } from "../../common/constants/notificationChannel";
import { NotificationPayload, NotificationResult } from "./notification.types";
import { sendMockNotification } from "./mockNotification.service";

/**
 * Send a notification via WhatsApp Business API (Meta Graph API).
 * Requires env vars: WHATSAPP_API_URL, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_TOKEN
 */
const sendWhatsAppNotification = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl || !phoneNumberId || !token) {
    console.warn(
      "[WhatsApp] Missing env vars — falling back to mock provider."
    );
    return sendMockNotification(payload);
  }

  try {
    const url = `${apiUrl}/${phoneNumberId}/messages`;

    const body = JSON.stringify({
      messaging_product: "whatsapp",
      to: payload.to,
      type: "text",
      text: { body: payload.message },
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = (await response.json()) as {
      messages?: { id: string }[];
      error?: { message: string };
    };

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message ?? `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id ?? "unknown",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
};

/**
 * Main notification dispatcher — routes to the correct provider based on
 * NOTIFICATION_PROVIDER env var (default: "mock").
 */
export const sendNotification = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  const provider = process.env.NOTIFICATION_PROVIDER ?? "mock";

  if (payload.channel === NotificationChannel.WHATSAPP && provider === "whatsapp") {
    return sendWhatsAppNotification(payload);
  }

  // Fallback: mock for all other cases (SMS, EMAIL stubs, or mock provider)
  return sendMockNotification(payload);
};

