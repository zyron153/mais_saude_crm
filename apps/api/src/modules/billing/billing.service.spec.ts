import { Test } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { BillingRepository } from "./billing.repository";
import { R2Service } from "../../common/services/r2.service";

const repo = {
  nextInvoiceNumber: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdLite: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  createPayment: jest.fn(),
  sumPayments: jest.fn(),
  findServiceById: jest.fn(),
};
const r2 = { isConfigured: jest.fn(), upload: jest.fn(), signedUrl: jest.fn() };

const INVOICE = {
  id: "inv-1",
  status: "issued",
  total: "2000",
  invoiceNumber: "INV-2026-0001",
};

describe("BillingService", () => {
  let service: BillingService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: BillingRepository, useValue: repo },
        { provide: R2Service, useValue: r2 },
      ],
    }).compile();
    service = mod.get(BillingService);
    jest.clearAllMocks();
    r2.isConfigured.mockReturnValue(false);
  });

  describe("recordPayment — payment status machine", () => {
    beforeEach(() => {
      repo.findByIdLite.mockResolvedValue(INVOICE);
      repo.createPayment.mockResolvedValue({});
      repo.updateStatus.mockResolvedValue({});
    });

    it("transitions to paid when the full amount is recorded", async () => {
      repo.sumPayments.mockResolvedValue({ _sum: { amount: "2000" } });
      await service.recordPayment("inv-1", { amount: 2000, method: "cash" });
      expect(repo.updateStatus).toHaveBeenCalledWith(
        "inv-1",
        expect.objectContaining({ status: "paid", amountPaid: 2000 })
      );
    });

    it("transitions to partially_paid when a partial amount is recorded", async () => {
      repo.sumPayments.mockResolvedValue({ _sum: { amount: "800" } });
      await service.recordPayment("inv-1", { amount: 800, method: "bank_transfer" });
      expect(repo.updateStatus).toHaveBeenCalledWith(
        "inv-1",
        expect.objectContaining({ status: "partially_paid", amountPaid: 800 })
      );
    });

    it("calculates remaining balance correctly across two payments", async () => {
      // First payment: 500
      repo.sumPayments.mockResolvedValue({ _sum: { amount: "500" } });
      await service.recordPayment("inv-1", { amount: 500, method: "cash" });
      expect(repo.updateStatus).toHaveBeenCalledWith(
        "inv-1",
        expect.objectContaining({ status: "partially_paid", amountPaid: 500 })
      );

      // Second payment: remaining 1500
      repo.sumPayments.mockResolvedValue({ _sum: { amount: "2000" } });
      await service.recordPayment("inv-1", { amount: 1500, method: "cash" });
      expect(repo.updateStatus).toHaveBeenCalledWith(
        "inv-1",
        expect.objectContaining({ status: "paid", amountPaid: 2000 })
      );
    });

    it("throws BadRequestException on a paid invoice", async () => {
      repo.findByIdLite.mockResolvedValue({ ...INVOICE, status: "paid" });
      await expect(
        service.recordPayment("inv-1", { amount: 100, method: "cash" })
      ).rejects.toThrow(BadRequestException);
      expect(repo.createPayment).not.toHaveBeenCalled();
    });

    it("throws BadRequestException on a cancelled invoice", async () => {
      repo.findByIdLite.mockResolvedValue({ ...INVOICE, status: "cancelled" });
      await expect(
        service.recordPayment("inv-1", { amount: 100, method: "cash" })
      ).rejects.toThrow(BadRequestException);
    });

    it("throws NotFoundException for an unknown invoice id", async () => {
      repo.findByIdLite.mockResolvedValue(null);
      await expect(
        service.recordPayment("inv-999", { amount: 100, method: "cash" })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("createDraft", () => {
    it("creates a draft invoice with status=draft and correct totals", async () => {
      repo.nextInvoiceNumber.mockResolvedValue("INV-2026-0002");
      repo.create.mockResolvedValue({});

      await service.createDraft({
        patientId: "patient-1",
        appointmentId: "appt-1",
        serviceId: "service-1",
        serviceName: "Consulta Geral",
        unitPrice: 1500,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: "INV-2026-0002",
          subtotal: 1500,
          total: 1500,
          status: "draft",
        })
      );
    });
  });
});
