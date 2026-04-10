import type { MiddlewareHandler } from "hono";

const store = new Map<string, { count: number; reset: number }>();

export function rateLimit(limit: number, windowMs = 60_000): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.reset) {
      store.set(key, { count: 1, reset: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return c.json({ success: false, message: "Too many requests" }, 429);
    }

    record.count++;
    return next();
  };
}
