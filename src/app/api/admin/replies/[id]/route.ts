import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

// PATCH: Update reply status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const reply = await db.reply.findUnique({
      where: { id },
    });

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const updated = await db.reply.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      id: updated.id,
      anonymousName: updated.anonymousName,
      content: updated.content,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      message: `Reply has been ${status}.`,
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    return NextResponse.json({ error: "Failed to update reply" }, { status: 500 });
  }
}

// DELETE: Delete a single reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const reply = await db.reply.findUnique({ where: { id } });
    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    await db.reply.delete({ where: { id } });

    return NextResponse.json({ message: "Reply deleted successfully." });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json({ error: "Failed to delete reply" }, { status: 500 });
  }
}
