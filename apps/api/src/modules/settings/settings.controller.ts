import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { SettingsService } from "./settings.service";

@Controller("settings")
@Roles("admin", "receptionist", "doctor", "nurse")
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Patch("clinic")
  @Roles("admin", "receptionist")
  updateClinic(@Body() body: Record<string, unknown>) {
    return this.service.upsert("clinic", body);
  }

  @Patch("notifications")
  @Roles("admin", "receptionist")
  updateNotifications(@Body() body: Record<string, unknown>) {
    return this.service.upsert("notifications", body);
  }

  @Patch("integration/:key")
  @Roles("admin")
  updateIntegration(
    @Param("key") key: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.upsert(`integration_${key}`, body);
  }
}
