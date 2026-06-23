import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        durationMinutes: true,
        price: true,
      },
      orderBy: { name: "asc" },
    });
  }

  findById(id: string) {
    return this.prisma.service.findFirst({
      where: { id, active: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        durationMinutes: true,
        price: true,
      },
    });
  }
}
