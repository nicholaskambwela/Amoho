import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Return all replies with their post info (requires auth)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const replies = await db.reply.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            anonymousName: true,
            category: true,
            content: true,
          },
        },
      },
    });

    const repliesWithPost = replies.map((r) => ({
      id: r.id,
      anonymousName: r.anonymousName,
      content: r.content,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      post: r.post,
    }));

    const pendingCount = repliesWithPost.filter((r) => r.status === "pending").length;
    const approvedCount = repliesWithPost.filter((r) => r.status === "approved").length;
    const rejectedCount = repliesWithPost.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      replies: repliesWithPost,
      summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: repliesWithPost.length,
      },
    });
  } catch (error) {
    console.error("Error fetching admin replies:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}
