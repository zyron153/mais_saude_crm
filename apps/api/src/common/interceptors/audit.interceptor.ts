import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (!MUTATING_METHODS.has(request.method)) return next.handle();

    const user = request.user;
    const { method, url, ip, headers } = request;

    return next.handle().pipe(
      tap(() => {
        const segments = url.split("/").filter(Boolean);
        const resource = segments[1] ?? "unknown";
        const resourceId = segments[2] ?? undefined;

        this.prisma.auditLog
          .create({
            data: {
              actorId: user?.sub,
              actorEmail: user?.email,
              action: method,
              resource,
              resourceId,
              ipAddress: ip,
              userAgent: headers["user-agent"]?.slice(0, 300),
              metadata: { url },
            },
          })
          .catch(() => {
            // Audit failures must never break the request
          });
      })
    );
  }
}
