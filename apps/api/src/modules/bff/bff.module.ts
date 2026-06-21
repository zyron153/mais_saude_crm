import { Module } from "@nestjs/common";
import { BffController } from "./bff.controller";
import { BffService } from "./bff.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BffController],
  providers: [BffService],
})
export class BffModule {}
