import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("services")
@Roles("admin", "receptionist", "doctor", "nurse")
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}
