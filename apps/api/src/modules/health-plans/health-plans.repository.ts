import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@cms/database";

@Injectable()
export class HealthPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Products ──────────────────────────────────────────────────────────────

  findAllProducts(activeOnly = true) {
    return this.prisma.healthPlanProduct.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { name: "asc" },
    });
  }

  findProductById(id: string) {
    return this.prisma.healthPlanProduct.findUnique({ where: { id } });
  }

  createProduct(data: Prisma.HealthPlanProductCreateInput) {
    return this.prisma.healthPlanProduct.create({ data });
  }

  updateProduct(id: string, data: Prisma.HealthPlanProductUpdateInput) {
    return this.prisma.healthPlanProduct.update({ where: { id }, data });
  }

  // ─── Plans ─────────────────────────────────────────────────────────────────

  findAllPlans(companyId?: string) {
    return this.prisma.healthPlan.findMany({
      where: companyId ? { companyId } : {},
      include: { product: true, company: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findPlanById(id: string) {
    return this.prisma.healthPlan.findUnique({
      where: { id },
      include: { product: true, company: true },
    });
  }

  createPlan(data: Prisma.HealthPlanCreateInput) {
    return this.prisma.healthPlan.create({ data, include: { product: true, company: true } });
  }
}
