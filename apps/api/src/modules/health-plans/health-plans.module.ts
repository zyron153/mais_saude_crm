import { Module } from "@nestjs/common";
import { HealthPlansController } from "./health-plans.controller";
import { HealthPlansService } from "./health-plans.service";
import { HealthPlansRepository } from "./health-plans.repository";

@Module({
  controllers: [HealthPlansController],
  providers: [HealthPlansService, HealthPlansRepository],
  exports: [HealthPlansService],
})
export class HealthPlansModule {}
