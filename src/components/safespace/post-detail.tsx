"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { formatTimeAgo } from "@/lib/time-format";
import { useStore } from "@/lib/store";
import { ReplySection } from "./reply-section";

interface PostData {
  id: string;
  anonymousName: string;
  content: string;
  category: string;
  createdAt: string;
  replies: {
    id: string;
    anonymousName: string;
    content: string;
    createdAt: string;
  }[];
}

const categoryColors: Record<string, string> = {
  General: "bg-safe-sage/15 text-safe-sage border-safe-sage/20",
  // Relationships
  Relationships: "bg-primary/15 text-primary border-primary/20",
  Breakup: "bg-safe-rose/15 text-safe-rose border-safe-rose/20",
  "Family Conflict": "bg-safe-amber/15 text-safe-amber border-safe-amber/20",
  "Trust Issues": "bg-safe-rose/15 text-safe-rose border-safe-rose/20",
  // Mental Health
  "Anxiety & Stress": "bg-safe-amber/15 text-safe-amber border-safe-amber/20",
  Depression: "bg-safe-blue/15 text-safe-blue border-safe-blue/20",
  "Loneliness & Isolation": "bg-safe-blue/15 text-safe-blue border-safe-blue/20",
  "Self-Esteem & Identity": "bg-safe-sage/15 text-safe-sage border-safe-sage/20",
  "Grief & Loss": "bg-safe-rose/15 text-safe-rose border-safe-rose/20",
  // Life Challenges
  "Work & Career Stress": "bg-safe-amber/15 text-safe-amber border-safe-amber/20",
  "Burnout & Exhaustion": "bg-safe-amber/15 text-safe-amber border-safe-amber/20",
  "Addiction & Recovery": "bg-safe-blue/15 text-safe-blue border-safe-blue/20",
  "Moving On": "bg-safe-green/15 text-safe-green border-safe-green/20",
};

export function PostDetail() {
  const { selectedPostId, setView, refreshKey } = useStore();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPostId) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts/${selectedPostId}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch {
        setError("This post could not be found. It may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [selectedPostId, refreshKey]);

  const handleShare = () => {
    if (!post) return;
    const link = generateWhatsAppLink(post.id, post.content);
    window.open(link, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("feed")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-xl border border-border/40 bg-card/80 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("feed")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
        <div className="rounded-xl border border-border/40 bg-card/80 p-8 text-center">
          <p className="text-sm text-muted-foreground">{error || "Post not found."}</p>
        </div>
      </div>
    );
  }

  const timeAgo = formatTimeAgo(post.createdAt);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("feed")}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Button>

      {/* Post */}
      <div className="rounded-xl border border-border/40 bg-card/80 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-medium text-primary">
              {post.anonymousName}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`text-[11px] ${categoryColors[post.category] || categoryColors.General}`}
          >
            {post.category}
          </Badge>
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {post.content}
        </p>

        {/* Share */}
        <div className="mt-5 flex justify-end border-t border-border/30 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </Button>
        </div>
      </div>

      {/* Replies */}
      <ReplySection postId={post.id} replies={post.replies} />
    </div>
  );
}
