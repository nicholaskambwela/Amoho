import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = body;

    if (type !== "heart" && type !== "cry") {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, hearts: true, cries: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const field = type === "heart" ? "hearts" : "cries";
    const newCount = post[field] + 1;

    const updated = await db.post.update({
      where: { id },
      data: { [field]: newCount },
      select: { hearts: true, cries: true },
    });

    return NextResponse.json({
      hearts: updated.hearts,
      cries: updated.cries,
    });

  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type !== "heart" && type !== "cry") {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, hearts: true, cries: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const field = type === "heart" ? "hearts" : "cries";
    const newCount = Math.max(0, post[field] - 1);

    const updated = await db.post.update({
      where: { id },
      data: { [field]: newCount },
      select: { hearts: true, cries: true },
    });

    return NextResponse.json({
      hearts: updated.hearts,
      cries: updated.cries,
    });

  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}