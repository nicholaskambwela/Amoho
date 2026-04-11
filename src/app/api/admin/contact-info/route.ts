import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Return all contact info entries (public — no auth needed)
export async function GET() {
  try {
    const entries = await db.contactInfo.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json({ error: "Failed to fetch contact info" }, { status: 500 });
  }
}

// PUT: Update/create contact info (requires admin auth)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "Entries must be an array" }, { status: 400 });
    }

    // Upsert each entry based on key
    for (const entry of entries) {
      if (!entry.key || !entry.value || !entry.label) {
        continue;
      }

      await db.contactInfo.upsert({
        where: { key: entry.key },
        update: {
          value: entry.value,
          label: entry.label,
          icon: entry.icon || "phone",
          order: entry.order ?? 0,
        },
        create: {
          key: entry.key,
          value: entry.value,
          label: entry.label,
          icon: entry.icon || "phone",
          order: entry.order ?? 0,
        },
      });
    }

    // Return all entries after upsert
    const allEntries = await db.contactInfo.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ entries: allEntries });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json({ error: "Failed to update contact info" }, { status: 500 });
  }
}
