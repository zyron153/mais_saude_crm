import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async upsert(key: string, value: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.setting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    });
    if (key === "notifications") {
      await this.notifications.syncScheduledJobs(value as Record<string, boolean>);
    }
    return { ok: true };
  }
}
