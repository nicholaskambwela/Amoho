import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, hashSecret } from "@/lib/admin-auth";

// POST: Admin login (or first-time registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, name, email, phone } = body;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json(
        { error: "Secret is required" },
        { status: 400 }
      );
    }

    const hashedSecret = hashSecret(secret);

    // Check if this is a registration request (has name + email)
    if (name && email) {
      const adminCount = await db.admin.count();

      // Allow registration if no admins exist, or if requester is a superadmin
      const authAdmin = await verifyAdmin(request);

      if (adminCount > 0 && (!authAdmin || authAdmin.role !== "superadmin")) {
        return NextResponse.json(
          { error: "Registration is only available for superadmins" },
          { status: 403 }
        );
      }

      // Check for duplicate email
      const existing = await db.admin.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "An admin with this email already exists" },
          { status: 409 }
        );
      }

      const role = adminCount === 0 ? "superadmin" : "admin";

      const admin = await db.admin.create({
        data: {
          name,
          email,
          phone: phone || "",
          secret: hashedSecret,
          role,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      return NextResponse.json(
        { success: true, admin },
        { status: 201 }
      );
    }

    // Login flow — verify secret
    const admin = await db.admin.findFirst({
      where: { secret: hashedSecret },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error("Error in admin auth:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
