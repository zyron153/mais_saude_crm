import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateStaffDto } from "@cms/types";
import { StaffRepository } from "./staff.repository";

@Injectable()
export class StaffService {
  constructor(private readonly repo: StaffRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const staff = await this.repo.findById(id);
    if (!staff) throw new NotFoundException(`Staff ${id} not found`);
    return staff;
  }

  create(dto: CreateStaffDto) {
    return this.repo.create(dto);
  }
}
