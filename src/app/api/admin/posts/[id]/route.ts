import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

// PATCH: Update post status (approve/reject)
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
      return NextResponse.json({ error: "Invalid status. Use 'approved' or 'rejected'." }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      id: updatedPost.id,
      anonymousName: updatedPost.anonymousName,
      content: updatedPost.content,
      category: updatedPost.category,
      status: updatedPost.status,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      message: `Post has been ${status}.`,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
