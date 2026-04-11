"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2, MessageCircle, Clock, Hourglass } from "lucide-react";
import { formatTimeAgo } from "@/lib/time-format";
import { useStore } from "@/lib/store";

interface Reply {
  id: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

interface ReplySectionProps {
  postId: string;
  replies: Reply[];
}

export function ReplySection({ postId, replies }: ReplySectionProps) {
  const { triggerRefresh } = useStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (content.trim().length < 10) {
      setError("Please write at least 10 characters. A kind word goes a long way.");
      return;
    }

    if (content.length > 1000) {
      setError("Your reply is too long. Please keep it under 1000 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Replies are now pending review — don't add to visible list
      setContent("");
      setSuccess(data.message || "Your reply has been submitted for review.");
      triggerRefresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Replies ({localReplies.length})
        </h3>
      </div>

      {/* Reply Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border/40 bg-card/80 p-5 space-y-3"
      >
        <Textarea
          placeholder="Write a kind, supportive reply..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(null);
          }}
          className="min-h-[80px] resize-none border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {content.length > 0 && (
              <>
                {content.length < 10
                  ? `${10 - content.length} more char${10 - content.length !== 1 ? "s" : ""} needed`
                  : `${1000 - content.length} remaining`}
              </>
            )}
          </p>
          <Button
            type="submit"
            disabled={isSubmitting || content.trim().length < 10}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/85"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Reply Anonymously
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {success && (
          <p className="flex items-center gap-1 text-xs text-safe-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {success}
          </p>
        )}
      </form>

      {/* Replies List */}
      {localReplies.length === 0 ? (
        <div className="rounded-xl border border-border/30 bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No replies yet. Be the first to offer support.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {localReplies.map((reply, index) => (
            <div
              key={reply.id}
              className="rounded-xl border border-border/30 bg-card/60 p-4 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-accent">
                  {reply.anonymousName}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(reply.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
