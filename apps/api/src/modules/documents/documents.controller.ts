import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, JwtUser } from "../../common/decorators/current-user.decorator";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get(":id/download-url")
  @Roles("admin", "doctor", "nurse", "receptionist", "lab_tech", "patient")
  async getDownloadUrl(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser
  ) {
    const doc = await this.service.findById(id);

    // Patients can only download their own documents
    if (
      user.realm_access.roles.includes("patient") &&
      !user.realm_access.roles.some((r) => ["admin", "doctor", "nurse", "receptionist", "lab_tech"].includes(r))
    ) {
      const patientId = user.patient_id;
      if (!patientId || doc.patientId !== patientId) {
        throw new UnauthorizedException("Access denied");
      }
    }

    return this.service.generateDownloadUrl(doc);
  }
}
