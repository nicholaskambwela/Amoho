"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2, MessageCircle, Clock, Phone, Heart } from "lucide-react";
import { formatTimeAgo } from "@/lib/time-format";
import { useStore } from "@/lib/store";

interface Reply {
  id: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

interface HelplineInfo {
  name: string;
  phone: string;
  type: string;
  city: string;
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
  const [crisisHelplines, setCrisisHelplines] = useState<HelplineInfo[] | null>(null);
  const [flagReason, setFlagReason] = useState<string | null>(null);
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCrisisHelplines(null);
    setFlagReason(null);

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

      setSuccess(data.message || "Your reply has been submitted for review.");

      // If crisis detected, show helplines prominently
      if (data.crisisDetected && data.helplines && data.helplines.length > 0) {
        setCrisisHelplines(data.helplines);
      }

      // If flagged (not crisis), show the reason
      if (data.requiresReview && data.flagReason) {
        setFlagReason(data.flagReason);
      }

      setContent("");
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

        {/* Crisis Helplines - shown prominently when crisis detected */}
        {crisisHelplines && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/80 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-700">
              <Heart className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                We care about you. Please reach out — these services are here to help.
              </p>
            </div>
            <div className="space-y-2">
              {crisisHelplines.slice(0, 5).map((helpline, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2 rounded-md p-2 ${
                    idx === 0
                      ? " bg-amber-50/80 dark:bg-amber-950/40"
                      : "bg-white/60 border border-amber-100/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${idx === 0 ? "text-amber-800 dark:text-amber-200" : "text-foreground"}`}>
                      {helpline.name}
                      {helpline.city && helpline.city !== "Nationwide" && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          — {helpline.city}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{helpline.type}</p>
                  </div>
                  <a
                    href={`tel:${helpline.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1.5 shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    {helpline.phone}
                  </a>
                </div>
              ))}
              {crisisHelplines.length > 5 && (
                <p className="text-xs text-amber-600 pt-1">
                  +{crisisHelplines.length - 5} more services available in the Resources tab
                </p>
              )}
            </div>
          </div>
        )}

        {/* Flagged reply notice */}
        {flagReason && !crisisHelplines && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 p-2 text-xs text-amber-700 animate-fade-in">
            Your reply is being reviewed and will appear once approved.
          </div>
        )}

        {/* Normal success (no crisis, no flag) */}
        {success && !crisisHelplines && !flagReason && (
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
