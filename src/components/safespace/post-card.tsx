"use client";

import { MessageCircle, Clock, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { formatTimeAgo } from "@/lib/time-format";
import { useStore } from "@/lib/store";

interface PostCardProps {
  post: {
    id: string;
    anonymousName: string;
    content: string;
    category: string;
    createdAt: string;
    replyCount: number;
  };
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

export function PostCard({ post }: PostCardProps) {
  const { selectPost } = useStore();
  const excerpt =
    post.content.length > 200
      ? post.content.substring(0, 200) + "..."
      : post.content;
  const timeAgo = formatTimeAgo(post.createdAt);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = generateWhatsAppLink(post.id, post.content);
    window.open(link, "_blank");
  };

  return (
    <Card
      className="group cursor-pointer border-border/40 bg-card/80 p-5 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
      onClick={() => selectPost(post.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          {/* Top: Name + Time */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {post.anonymousName}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>

          {/* Category Badge */}
          <div>
            <Badge
              variant="outline"
              className={`text-[11px] ${categoryColors[post.category] || categoryColors.General}`}
            >
              {post.category}
            </Badge>
          </div>

          {/* Content */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {excerpt}
          </p>
        </div>
      </div>

      {/* Footer: Reply Count + Share */}
      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>
            {post.replyCount}{" "}
            {post.replyCount === 1 ? "reply" : "replies"}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </Card>
  );
}
