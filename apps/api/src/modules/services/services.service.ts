import { Injectable, NotFoundException } from "@nestjs/common";
import { ServicesRepository } from "./services.repository";

@Injectable()
export class ServicesService {
  constructor(private readonly repo: ServicesRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const service = await this.repo.findById(id);
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }
}
