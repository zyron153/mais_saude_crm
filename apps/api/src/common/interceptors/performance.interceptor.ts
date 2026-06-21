import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { RequestContext } from "../context/request-context";

const SLOW_REQUEST_THRESHOLD_MS = 100;

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Perf");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ method: string; url: string }>();
    const response = http.getResponse<{
      setHeader: (k: string, v: string | number) => void;
    }>();

    const ctx = RequestContext.create();

    const applyHeaders = () => {
      const durationMs = RequestContext.durationMs(ctx);
      const { count, totalMs } = RequestContext.sqlStats(ctx);
      response.setHeader("X-Request-Id", ctx.requestId);
      response.setHeader("X-Request-Duration", durationMs);
      response.setHeader("X-Query-Count", count);
      response.setHeader("X-Query-Time", totalMs);
      return { durationMs, count, totalMs };
    };

    const logRequest = (durationMs: number, count: number, totalMs: number) => {
      const tag = durationMs > SLOW_REQUEST_THRESHOLD_MS ? "[SLOW]" : "[PERF]";
      this.logger.log(
        `${tag} ${request.method} ${request.url} — ${durationMs}ms (${count} quer${count === 1 ? "y" : "ies"}, ${totalMs}ms SQL)`
      );
    };

    return new Observable((observer) => {
      RequestContext.run(ctx, () => {
        next
          .handle()
          .pipe(
            tap(() => {
              const { durationMs, count, totalMs } = applyHeaders();
              logRequest(durationMs, count, totalMs);
            }),
            catchError((err: unknown) => {
              const { durationMs, count, totalMs } = applyHeaders();
              logRequest(durationMs, count, totalMs);
              throw err;
            })
          )
          .subscribe({
            next: (v) => observer.next(v),
            error: (e) => observer.error(e),
            complete: () => observer.complete(),
          });
      });
    });
  }
}
