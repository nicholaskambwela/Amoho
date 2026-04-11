import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

async function seed() {
  console.log("🌱 Seeding SafeSpace database...\n");

  // 1. Create default superadmin if none exists
  const adminCount = await db.admin.count();
  if (adminCount === 0) {
    const secret = process.env.ADMIN_SECRET || "safespace2024";
    const admin = await db.admin.create({
      data: {
        name: "SafeSpace Admin",
        email: "admin@safespace.zm",
        phone: "+260 977 000000",
        secret: hashSecret(secret),
        role: "superadmin",
      },
    });
    console.log(`✅ Created superadmin: ${admin.email} (secret: "${secret}")`);
  } else {
    console.log(`ℹ️  ${adminCount} admin(s) already exist — skipping admin creation.`);
  }

  // 2. Create default contact info entries
  const contactEntries = [
    { key: "primary_phone", value: "+260 977 000000", label: "Phone", icon: "phone", order: 0 },
    { key: "whatsapp", value: "+260 977 000000", label: "WhatsApp", icon: "message-circle", order: 1 },
    { key: "email", value: "admin@safespace.zm", label: "Email", icon: "mail", order: 2 },
    { key: "crisis_line", value: "933", label: "Crisis Line (Lifeline Zambia)", icon: "alert-triangle", order: 3 },
  ];

  for (const entry of contactEntries) {
    await db.contactInfo.upsert({
      where: { key: entry.key },
      update: { value: entry.value, label: entry.label, icon: entry.icon, order: entry.order },
      create: entry,
    });
  }
  console.log(`✅ Seeded ${contactEntries.length} contact info entries.`);

  console.log("\n🎉 Seeding complete!");
  console.log("   → Login with the admin secret to access the Admin Panel.");
  console.log("   → Default secret: " + (process.env.ADMIN_SECRET || "safespace2024"));
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
