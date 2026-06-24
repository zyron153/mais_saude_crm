import { Test } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { PatientsService } from "./patients.service";
import { PatientsRepository } from "./patients.repository";

const repo = {
  findMany: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  findByPhone: jest.fn(),
  findByNif: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createNote: jest.fn(),
  findTimelineEvents: jest.fn(),
};

const BASE_DTO = {
  fullName: "Ana Costa",
  dateOfBirth: "1990-06-15",
  gender: "female" as const,
  phone: "+238 991 23 45",
  consentGiven: true,
};

describe("PatientsService", () => {
  let service: PatientsService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PatientsRepository, useValue: repo },
      ],
    }).compile();
    service = mod.get(PatientsService);
    jest.clearAllMocks();
  });

  describe("phone normalisation", () => {
    beforeEach(() => {
      repo.findByPhone.mockResolvedValue(null);
      repo.findByNif.mockResolvedValue(null);
      repo.create.mockResolvedValue({});
    });

    it("strips spaces and keeps digits, prepends +", async () => {
      await service.create({ ...BASE_DTO, phone: "+238 991 23 45" });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+2389912345" })
      );
    });

    it("strips dashes from formatted number", async () => {
      await service.create({ ...BASE_DTO, phone: "238-991-23-45" });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+2389912345" })
      );
    });

    it("handles already-normalised E.164 without double +", async () => {
      await service.create({ ...BASE_DTO, phone: "+2389912345" });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+2389912345" })
      );
    });
  });

  describe("NIF uniqueness check", () => {
    it("throws ConflictException when NIF already exists", async () => {
      repo.findByPhone.mockResolvedValue(null);
      repo.findByNif.mockResolvedValue({ id: "existing-id" });

      await expect(
        service.create({ ...BASE_DTO, nif: "123456789" })
      ).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("skips NIF check when NIF is not provided", async () => {
      repo.findByPhone.mockResolvedValue(null);
      repo.create.mockResolvedValue({});

      await service.create(BASE_DTO);
      expect(repo.findByNif).not.toHaveBeenCalled();
    });

    it("throws ConflictException when phone already exists", async () => {
      repo.findByPhone.mockResolvedValue({ id: "existing-id" });
      repo.findByNif.mockResolvedValue(null);

      await expect(service.create(BASE_DTO)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
