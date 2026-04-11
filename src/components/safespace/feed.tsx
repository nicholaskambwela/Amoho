"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { Heart, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_GROUPS } from "@/lib/categories";

interface Post {
  id: string;
  anonymousName: string;
  content: string;
  category: string;
  createdAt: string;
  replyCount: number;
}

type GroupKey = keyof typeof CATEGORY_GROUPS;

export function Feed() {
  const { refreshKey, categoryFilter, setCategoryFilter } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params =
        categoryFilter && categoryFilter !== "All"
          ? `?category=${encodeURIComponent(categoryFilter)}`
          : "";
      const res = await fetch(`/api/posts${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch {
      setError("Unable to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshKey, categoryFilter]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroup((prev) => (prev === groupName ? null : groupName));
  };

  const isFilterActive = (filterValue: string) => categoryFilter === filterValue;

  return (
    <div className="space-y-5">
      {/* Category Filter — grouped for easier browsing */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {/* All Topics */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCategoryFilter("All")}
            className={
              isFilterActive("All")
                ? "shrink-0 bg-primary/15 text-primary hover:bg-primary/20"
                : "shrink-0 text-muted-foreground hover:text-foreground"
            }
          >
            All Topics
          </Button>

          {/* Grouped category buttons */}
          {(Object.entries(CATEGORY_GROUPS) as [string, readonly string[]][]).map(
            ([groupName, cats]) => {
              if (!cats || groupName === "All Topics") return null;

              // Check if any category in this group is the active filter
              const hasActiveChild = categoryFilter !== "All" && categoryFilter !== groupName && cats.includes(categoryFilter as never);
              const isGroupActive = isFilterActive(groupName);

              return (
                <Button
                  key={groupName}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (groupName === categoryFilter) {
                      // Already on this group — collapse it
                      setCategoryFilter("All");
                    } else {
                      setCategoryFilter(groupName);
                      setExpandedGroup(groupName);
                    }
                  }}
                  className={
                    isGroupActive
                      ? "shrink-0 bg-primary/15 text-primary hover:bg-primary/20"
                      : hasActiveChild
                        ? "shrink-0 text-primary hover:text-primary"
                        : "shrink-0 text-muted-foreground hover:text-foreground"
                  }
                >
                  {groupName}
                </Button>
              );
            }
          )}
        </div>

        {/* Expanded group sub-categories */}
        {expandedGroup && categoryFilter === expandedGroup && CATEGORY_GROUPS[expandedGroup as GroupKey] && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 pl-1 animate-fade-in custom-scrollbar">
            {(CATEGORY_GROUPS[expandedGroup as GroupKey] as readonly string[]).map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={
                  isFilterActive(cat)
                    ? "shrink-0 bg-primary/15 text-primary hover:bg-primary/20 text-xs"
                    : "shrink-0 text-muted-foreground hover:text-foreground text-xs"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 bg-card/80 p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-10 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              No stories yet
            </h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Be the first to share. Your story could help someone feel less
              alone. Whatever you&apos;re going through, you don&apos;t have to
              face it by yourself.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="animate-fade-in">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
