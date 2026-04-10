import { cors } from "hono/cors";

export function createCorsMiddleware(appUrl: string) {
  return cors({
    origin: appUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
}
