import { Controller, Get, Post, Query, Body } from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  AvailabilityQuery,
  AvailabilityQuerySchema,
  PublicBookingDto,
  PublicBookingSchema,
} from "@cms/types";
import { PublicService } from "./public.service";

@Public()
@Controller("public")
export class PublicController {
  constructor(private readonly svc: PublicService) {}

  @SkipThrottle()
  @Get("services")
  getServices() {
    return this.svc.getServices();
  }

  @SkipThrottle()
  @Get("staff")
  getStaff() {
    return this.svc.getStaff();
  }

  @SkipThrottle()
  @Get("availability")
  getAvailability(
    @Query(new ZodValidationPipe(AvailabilityQuerySchema)) query: AvailabilityQuery,
  ) {
    return this.svc.getAvailability(query);
  }

  // Stricter throttle: 10 booking attempts per hour per IP
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @Post("bookings")
  createBooking(
    @Body(new ZodValidationPipe(PublicBookingSchema)) dto: PublicBookingDto,
  ) {
    return this.svc.createBooking(dto);
  }
}
