import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAnonymousName } from "@/lib/anonymous-names";

// GET: Return only approved replies for a post (public view)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post || post.status !== "approved") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const replies = await db.reply.findMany({
      where: { postId: id, status: "approved" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        anonymousName: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}

// POST: Create reply for a post (pending approval)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ error: "Your reply must be at least 10 characters long." }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: "Your reply is too long. Please keep it under 1000 characters." }, { status: 400 });
    }

    // Check if post exists and is approved
    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const reply = await db.reply.create({
      data: {
        postId: id,
        anonymousName: generateAnonymousName(),
        content: content.trim(),
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        id: reply.id,
        anonymousName: reply.anonymousName,
        content: reply.content,
        createdAt: reply.createdAt,
        message: "Your reply has been submitted and is pending review. Thank you for supporting the community.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}
