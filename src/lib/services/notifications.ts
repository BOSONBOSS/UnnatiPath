/**
 * Notification Service Adapter (WhatsApp / SMS / Web Portal)
 * For 30, 90, 180, and 365-day longitudinal check-in touchpoints.
 */

export interface DispatchNotificationParams {
  traineeId: string;
  recipientPhone: string;
  checkpointDays: 30 | 90 | 180 | 365;
  channel: "WHATSAPP" | "SMS" | "PORTAL";
  actionUrl: string;
}

export class NotificationService {
  static async sendCheckinPrompt(
    params: DispatchNotificationParams
  ): Promise<{ success: boolean; messageId: string; timestamp: string }> {
    // Simulated WhatsApp / Twilio delivery
    const timestamp = new Date().toISOString();
    return {
      success: true,
      messageId: `msg_${params.channel.toLowerCase()}_${Date.now()}`,
      timestamp,
    };
  }
}
