import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.patientDocument.findUnique({ where: { id } });
  }

  findByPatient(patientId: string) {
    return this.prisma.patientDocument.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });
  }
}
