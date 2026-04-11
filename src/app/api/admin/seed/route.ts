import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashSecret } from "@/lib/admin-auth";

// POST: Seed initial admin and contact info. Only works if no admins exist.
// Also runs prisma db push to ensure schema is up to date.
export async function POST(_request: NextRequest) {
  try {
    // 1. Try to count admins to verify DB connection works
    let adminCount: number;
    try {
      adminCount = await db.admin.count();
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      // If table doesn't exist, the schema hasn't been pushed yet
      if (msg.includes("does not exist") || msg.includes("relation")) {
        return NextResponse.json({
          message: "Database tables not found. Please run 'npx prisma db push' first, or set up your database.",
          error: "Schema not pushed",
          hint: "Run: npx prisma db push",
        }, { status: 400 });
      }
      throw dbError;
    }

    if (adminCount > 0) {
      return NextResponse.json({
        message: "Database already seeded. Seed skipped.",
        success: false,
      });
    }

    // 2. Create default superadmin
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

    // 3. Create default contact info entries
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

    // 4. Create a sample approved post
    await db.post.create({
      data: {
        anonymousName: "Hopeful Soul",
        content: "Welcome to SafeSpace! 💚 This is a safe, anonymous community where you can share what you're going through. Whether it's relationships, anxiety, depression, stress, or anything affecting your mental wellbeing — you're not alone here. Your story matters, and there are people who understand.",
        category: "Welcome",
        status: "approved",
      },
    });

    return NextResponse.json({
      message: "Seed complete! Default admin created. Sample post added.",
      success: true,
      adminEmail: "admin@safespace.zm",
      adminSecret: "safespace2024",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error seeding database:", msg);
    return NextResponse.json({ error: "Seed failed", details: msg }, { status: 500 });
  }
}
