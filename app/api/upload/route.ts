import { isAdmin } from "@/lib/adminSession";
import { isCloudinaryConfigured, uploadProductImage } from "@/lib/cloudinary-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Admin-only: upload an image file to Cloudinary, return secure HTTPS URL for product storage.
 * Form field name: `file`
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return Response.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image must be 5MB or smaller" }, { status: 413 });
  }

  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: "Use JPEG, PNG, WebP, or GIF" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { secureUrl, publicId } = await uploadProductImage(buffer, file.type);
    return Response.json({ secureUrl, publicId });
  } catch (e) {
    console.error("[upload]", e);
    const message =
      e instanceof Error ? e.message : "Could not upload image. Try again or use a smaller file.";
    return Response.json({ error: message }, { status: 502 });
  }
}
