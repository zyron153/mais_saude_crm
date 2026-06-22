import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { BffService } from "./bff.service";

@Controller("bff")
@Roles("admin", "receptionist", "doctor", "nurse")
export class BffController {
  constructor(private readonly service: BffService) {}

  @Get("patient-screen/:id")
  getPatientScreen(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getPatientScreen(id);
  }

  @Get("staff")
  getStaff() {
    return this.service.getStaffList();
  }

  @Get("billing-summary")
  getBillingSummary() {
    return this.service.getBillingSummary();
  }
}
