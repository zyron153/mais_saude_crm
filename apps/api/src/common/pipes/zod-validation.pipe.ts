import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown) {
    if (!this.schema) return value;
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        error: "Validation Error",
        message: result.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    return result.data;
  }
}
