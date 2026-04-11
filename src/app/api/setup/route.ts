import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashSecret } from "@/lib/admin-auth";

// This endpoint is called automatically to ensure the database is seeded.
// It's safe to call multiple times — it only seeds if the DB is empty.
export async function GET(_request: NextRequest) {
  try {
    const adminCount = await db.admin.count();

    if (adminCount > 0) {
      return NextResponse.json({ seeded: true, message: "Already seeded" });
    }

    // Auto-seed if database is empty
    const defaultSecret = process.env.ADMIN_SECRET || "safespace2024";
    const hashedSecret = hashSecret(defaultSecret);

    await db.admin.create({
      data: {
        name: "SafeSpace Admin",
        email: "admin@safespace.zm",
        phone: "",
        secret: hashedSecret,
        role: "superadmin",
      },
    });

    const defaultEntries = [
      { key: "primary_phone", value: "+260 211 254073", label: "Chainama Hospital", icon: "phone", order: 0 },
      { key: "crisis_line", value: "933", label: "Lifeline Zambia (Crisis Line)", icon: "phone-call", order: 1 },
      { key: "email", value: "info@safespace.zm", label: "Email Us", icon: "mail", order: 2 },
      { key: "whatsapp", value: "+260XXXXXXXXX", label: "WhatsApp", icon: "message-circle", order: 3 },
    ];

    for (const entry of defaultEntries) {
      await db.contactInfo.upsert({
        where: { key: entry.key },
        update: entry,
        create: entry,
      });
    }

    await db.post.create({
      data: {
        anonymousName: "Hopeful Soul",
        content: "Welcome to SafeSpace! 💚 This is a safe, anonymous community where you can share what you're going through. Whether it's relationships, anxiety, depression, stress, or anything affecting your mental wellbeing — you're not alone here.",
        category: "Welcome",
        status: "approved",
      },
    });

    return NextResponse.json({ seeded: true, message: "Auto-seeded successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ seeded: false, error: msg }, { status: 500 });
  }
}
