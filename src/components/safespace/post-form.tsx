"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { Send, CheckCircle2, Loader2, Phone, Heart } from "lucide-react";

interface HelplineInfo {
  name: string;
  phone: string;
  type: string;
  city: string;
}

export function PostForm({ onSuccess }: { onSuccess?: () => void }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [crisisHelplines, setCrisisHelplines] = useState<HelplineInfo[] | null>(null);
  const [flagReason, setFlagReason] = useState<string | null>(null);

  const charCount = content.length;
  const minChars = 20;
  const maxChars = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCrisisHelplines(null);
    setFlagReason(null);

    if (content.trim().length < minChars) {
      setError(
        `Please share a bit more — at least ${minChars} characters. Your story matters.`
      );
      return;
    }

    if (content.length > maxChars) {
      setError(
        `Your message is too long. Please keep it under ${maxChars} characters.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(data.message || "Your story has been submitted for review.");

      // If crisis detected, show helplines prominently
      if (data.crisisDetected && data.helplines && data.helplines.length > 0) {
        setCrisisHelplines(data.helplines);
      }

      // If flagged (not crisis), show the reason
      if (data.requiresReview && data.flagReason) {
        setFlagReason(data.flagReason);
      }

      setContent("");
      setCategory("General");
      onSuccess?.();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        Share Your Story
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="What's on your mind today? Share what you're going through — you're among people who understand..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            className="min-h-[120px] resize-none border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
            maxLength={maxChars}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {charCount < minChars
                ? `At least ${minChars - charCount} more character${minChars - charCount !== 1 ? "s" : ""} needed`
                : `${maxChars - charCount} characters remaining`}
            </p>
            {content.length > 0 && (
              <p
                className={`text-xs ${charCount >= minChars ? "text-safe-green" : "text-muted-foreground"}`}
              >
                {charCount >= minChars ? "Ready to share" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-48">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-border/50 bg-background/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || content.trim().length < minChars}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/85 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post Anonymously
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

               {/* Crisis Helplines - shown prominently when crisis detected */}
        {crisisHelplines && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-primary">
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
                      ? "bg-primary/15"
                      : "bg-card border border-border/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${idx === 0 ? "text-primary" : "text-foreground"}`}>
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
                    className="flex items-center gap-1.5 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    {helpline.phone}
                  </a>
                </div>
              ))}
              {crisisHelplines.length > 5 && (
                <p className="text-xs text-primary pt-1">
                  +{crisisHelplines.length - 5} more services available in the Resources tab
                </p>
              )}
            </div>
          </div>
        )}

        {/* Flagged content notice */}
        {flagReason && !crisisHelplines && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary animate-fade-in">
            <span className="font-medium">Under review: </span>
            Your post is being reviewed by our team and will appear once approved.
          </div>
        )}

        {/* Normal success (no crisis, no flag) */}
        {success && !crisisHelplines && !flagReason && (
          <div className="flex items-center gap-2 rounded-lg border border-safe-green/20 bg-safe-green/5 p-3 text-sm text-safe-green animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
