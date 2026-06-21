import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@cms/database";

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async nextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    // Session-level advisory lock keyed on year prevents duplicate numbers under concurrent load.
    // Lock is released automatically at transaction end or session close.
    const result = await this.prisma.$queryRaw<[{ next_seq: bigint }]>`
      SELECT pg_advisory_lock(${year}::bigint),
             (SELECT COUNT(*) FROM invoices
              WHERE created_at >= ${new Date(`${year}-01-01`)}
                AND created_at <  ${new Date(`${year + 1}-01-01`)}) + 1 AS next_seq
    `;
    const seq = String(Number(result[0].next_seq)).padStart(4, "0");
    await this.prisma.$queryRaw`SELECT pg_advisory_unlock(${year}::bigint)`;
    return `INV-${year}-${seq}`;
  }

  create(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({
      data,
      include: { items: true, payments: true },
    });
  }

  findById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { include: { service: { select: { name: true } } } },
        payments: true,
        patient: { select: { id: true, fullName: true, phone: true } },
      },
    });
  }

  findByIdLite(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      select: { id: true, status: true, total: true, invoiceNumber: true },
    });
  }

  findMany(args: Prisma.InvoiceFindManyArgs) {
    return this.prisma.invoice.findMany(args);
  }

  count(args: Prisma.InvoiceCountArgs) {
    return this.prisma.invoice.count(args);
  }

  update(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true, payments: true },
    });
  }

  createPayment(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({ data });
  }

  sumPayments(invoiceId: string) {
    return this.prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });
  }

  findServiceById(serviceId: string) {
    return this.prisma.service.findUnique({ where: { id: serviceId } });
  }
}
