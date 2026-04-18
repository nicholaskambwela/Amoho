import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAnonymousName } from "@/lib/anonymous-names";
import { moderateContent } from "@/lib/moderation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category && category !== "All" ? { status: "approved", category } : { status: "approved" };

    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { replies: { where: { status: "approved" } } },
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

    return NextResponse.json(postsWithCounts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, category } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (content.trim().length < 20) {
      return NextResponse.json({ error: "Your message must be at least 20 characters long. Sharing a bit more helps others understand and support you." }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Your message is too long. Please keep it under 2000 characters." }, { status: 400 });
    }

    const validCategories = [
      "General",
      "Relationships",
      "Breakup",
      "Family Conflict",
      "Trust Issues",
      "Anxiety & Stress",
      "Depression",
      "Loneliness & Isolation",
      "Self-Esteem & Identity",
      "Grief & Loss",
      "Work & Career Stress",
      "Burnout & Exhaustion",
      "Addiction & Recovery",
      "Moving On",
    ];

    const postCategory = validCategories.includes(category) ? category : "General";

    const moderation = await moderateContent(content.trim());

    let postStatus: "approved" | "pending";
let responseMessage: string;
let helplines: any[] = [];

if (moderation.crisis) {
  postStatus = "pending";
  
  if (moderation.helplines && moderation.helplines.length > 0) {
    responseMessage = "Thank you for sharing. We care about you and want to make sure you're okay. Please reach out to one of the support services below — they are here to help you.";
    helplines = moderation.helplines;
  } else {
    responseMessage = "Thank you for sharing. We care about you. Our team will reach out soon with support resources.";
  }
} else if (moderation.approved) {
  postStatus = "approved";
  responseMessage = "Your story has been shared with the community. Thank you for being brave enough to share — you're not alone.";
} else {
  postStatus = "pending";
  responseMessage = "Your story has been submitted for review. It will appear in the community feed once approved. Thank you for sharing.";
}

const responseData: Record<string, unknown> = {
  id: post.id,
  anonymousName: post.anonymousName,
  content: post.content,
  category: post.category,
  status: post.status,
  createdAt: post.createdAt,
  message: responseMessage,
};

if (moderation.crisis) {
  responseData.crisisDetected = true;
  responseData.crisisType = moderation.crisisType;
  if (helplines.length > 0) {
    responseData.helplines = helplines;
  }
}

if (!moderation.approved && !moderation.crisis) {
  responseData.requiresReview = true;
  responseData.flagReason = moderation.reason;
}
    if (!moderation.approved && !moderation.crisis) {
      responseData.requiresReview = true;
      responseData.flagReason = moderation.reason;
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
