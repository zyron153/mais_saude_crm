import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from "@nestjs/common";
import { StaffService } from "./staff.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateStaffSchema, CreateStaffDto } from "@cms/types";

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

  @Post()
  @Roles("admin")
  create(@Body(new ZodValidationPipe(CreateStaffSchema)) dto: CreateStaffDto) {
    return this.service.create(dto);
  }
}
