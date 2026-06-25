import { Module } from "@nestjs/common";
import { AppointmentsModule } from "../appointments/appointments.module";
import { PatientsModule } from "../patients/patients.module";
import { ServicesModule } from "../services/services.module";
import { StaffModule } from "../staff/staff.module";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [
    AppointmentsModule,
    PatientsModule,
    ServicesModule,
    StaffModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
