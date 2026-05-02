import { Hono } from "hono";
import type { Env } from "../env";

const imagesRoute = new Hono<{ Bindings: Env }>();

imagesRoute.get("/:path{.+}", async (c) => {
  const path = c.req.param("path");

  if (!c.env.QUESTION_IMAGES) {
    return c.json({ success: false, message: "R2 Bucket not configured" }, 500);
  }

  // The R2 key is stored without the leading '/images/' prefix.
  // Try the path as-is first, then try with images/ prefix for legacy keys.
  let object = await c.env.QUESTION_IMAGES.get(path);
  if (!object) {
    object = await c.env.QUESTION_IMAGES.get(`images/${path}`);
  }

  if (object === null) {
    return c.json({ success: false, message: "Image not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, {
    headers,
  });
});

// Added to allow seamless internal/local uploading of files to the R2 bucket without Cloudflare CLI Auth!
imagesRoute.put("/:filename", async (c) => {
  const filename = c.req.param("filename");
  if (!c.env.QUESTION_IMAGES) {
    return c.json({ success: false, message: "R2 Bucket not configured" }, 500);
  }

  const arrayBuffer = await c.req.arrayBuffer();
  await c.env.QUESTION_IMAGES.put(filename, arrayBuffer);
  
  return c.json({ success: true, message: `Successfully uploaded ${filename} to R2!` });
});

export default imagesRoute;
