import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { BillingRepository } from "./billing.repository";
import { R2Service } from "../../common/services/r2.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingRepository, R2Service],
  exports: [BillingService],
})
export class BillingModule {}
