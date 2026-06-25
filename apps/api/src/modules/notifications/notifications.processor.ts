import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor("notifications")
export class NotificationsProcessor {
  @Process("daily-summary")
  async handleDailySummary(_job: Job) {
    // Phase 2: compile today's appointments and email to staff at 07h30
    console.log("[Notifications] daily-summary fired");
  }

  @Process("overdue-invoices")
  async handleOverdueInvoices(_job: Job) {
    // Phase 2: email weekly overdue invoice report on Monday 09h00
    console.log("[Notifications] overdue-invoices fired");
  }

  @Process("send-confirm")
  async handleConfirm(job: Job<{ appointmentId: string }>) {
    // Phase 2: send WhatsApp booking confirmation
    console.log(`[Notifications] send-confirm for ${job.data.appointmentId}`);
  }

  @Process("send-cancel")
  async handleCancel(job: Job<{ appointmentId: string }>) {
    // Phase 2: send WhatsApp cancellation notification
    console.log(`[Notifications] send-cancel for ${job.data.appointmentId}`);
  }
}
