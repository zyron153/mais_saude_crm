import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { BillingRepository } from "./billing.repository";
import { InvoiceStatus } from "@cms/database";
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  InvoiceListQuery,
} from "@cms/types";

@Injectable()
export class BillingService {
  constructor(private readonly repo: BillingRepository) {}

  async create(dto: CreateInvoiceDto) {
    let subtotal = 0;
    const itemsData = [];

    for (const item of dto.items) {
      const total = item.unitPrice * item.quantity;
      subtotal += total;
      itemsData.push({
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
      });
    }

    const invoiceNumber = await this.repo.nextInvoiceNumber();

    return this.repo.create({
      invoiceNumber,
      patient: { connect: { id: dto.patientId } },
      ...(dto.appointmentId
        ? { appointment: { connect: { id: dto.appointmentId } } }
        : {}),
      subtotal,
      total: subtotal,
      status: "issued",
      issuedAt: new Date(),
      notes: dto.notes,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      items: { create: itemsData },
    });
  }

  async findById(id: string) {
    const invoice = await this.repo.findById(id);
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async findAll(query: InvoiceListQuery) {
    const { patientId, status, from, to, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(patientId ? { patientId } : {}),
      ...(status ? { status: status as InvoiceStatus } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59Z`) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.repo.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async recordPayment(invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.repo.findByIdLite(invoiceId);
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    if (["paid", "cancelled"].includes(invoice.status)) {
      throw new BadRequestException(
        `Cannot record payment on a ${invoice.status} invoice`
      );
    }

    await this.repo.createPayment({
      invoice: { connect: { id: invoiceId } },
      amount: dto.amount,
      method: dto.method as never,
      reference: dto.reference,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
    });

    const { _sum } = await this.repo.sumPayments(invoiceId);
    const totalPaid = Number(_sum.amount ?? 0);
    const amountDue = Number(invoice.total) - totalPaid;

    let newStatus: string;
    if (amountDue <= 0) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "issued";
    }

    return this.repo.update(invoiceId, {
      amountPaid: totalPaid,
      status: newStatus as never,
    });
  }

  async getReceiptUrl(invoiceId: string): Promise<{ url: string }> {
    const invoice = await this.repo.findByIdLite(invoiceId);
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    // Phase 1: PDF generation + R2 upload stubbed — returns placeholder
    // Phase 2: implement with @react-pdf/renderer + AWS SDK v3 S3Client
    return {
      url: `https://files.maissaudecv.com/receipts/${invoice.invoiceNumber}.pdf`,
    };
  }
}
