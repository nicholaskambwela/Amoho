import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Hash a secret using SHA-256 for storage comparison.
 */
export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/**
 * Verify admin authentication from the Authorization header.
 * Returns the admin record if valid, null otherwise.
 */
export async function verifyAdmin(
  request: NextRequest
): Promise<{ id: string; name: string; email: string; role: string; phone: string } | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const secret = authHeader.slice(7);
    if (!secret) return null;

    const hashedSecret = hashSecret(secret);

    const admin = await db.admin.findFirst({
      where: { secret: hashedSecret },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    return admin;
  } catch {
    return null;
  }
}
