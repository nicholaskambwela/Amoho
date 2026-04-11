import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Return all posts (including pending/rejected) for admin moderation
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    const postsWithCounts = posts.map((post) => ({
      id: post.id,
      anonymousName: post.anonymousName,
      content: post.content,
      category: post.category,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      replyCount: post._count.replies,
    }));

    // Also return summary counts
    const pendingCount = postsWithCounts.filter((p) => p.status === "pending").length;
    const approvedCount = postsWithCounts.filter((p) => p.status === "approved").length;
    const rejectedCount = postsWithCounts.filter((p) => p.status === "rejected").length;

    return NextResponse.json({
      posts: postsWithCounts,
      summary: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount, total: postsWithCounts.length },
    });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
