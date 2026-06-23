import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.staff.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        specialtyCode: true,
        phone: true,
        availability: {
          where: { active: true },
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
      },
      orderBy: { fullName: "asc" },
    });
  }

  findById(id: string) {
    return this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        specialtyCode: true,
        phone: true,
        availability: {
          where: { active: true },
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
      },
    });
  }
}
