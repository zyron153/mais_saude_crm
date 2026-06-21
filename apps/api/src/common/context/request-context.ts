import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface QueryRecord {
  duration: number;
  query: string;
}

export interface IRequestContext {
  requestId: string;
  startTime: [number, number]; // process.hrtime() tuple
  queries: QueryRecord[];
}

const storage = new AsyncLocalStorage<IRequestContext>();

export const RequestContext = {
  create: (): IRequestContext => ({
    requestId: randomUUID(),
    startTime: process.hrtime(),
    queries: [],
  }),

  run<T>(ctx: IRequestContext, fn: () => T): T {
    return storage.run(ctx, fn);
  },

  get(): IRequestContext | undefined {
    return storage.getStore();
  },

  durationMs(ctx: IRequestContext): number {
    const [sec, ns] = process.hrtime(ctx.startTime);
    return Math.round(sec * 1000 + ns / 1_000_000);
  },

  sqlStats(ctx: IRequestContext): { count: number; totalMs: number } {
    return {
      count: ctx.queries.length,
      totalMs: Math.round(ctx.queries.reduce((sum, q) => sum + q.duration, 0)),
    };
  },
};
