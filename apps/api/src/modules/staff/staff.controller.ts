import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { StaffService } from "./staff.service";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("staff")
@Roles("admin", "receptionist", "doctor", "nurse")
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}
