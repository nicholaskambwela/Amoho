"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Check,
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  LogOut,
  Lock,
  UserPlus,
  Trash2,
  MessageSquare,
  Settings,
  Shield,
  Plus,
} from "lucide-react";
import { useStore } from "@/lib/store";

// ─── Types ───────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AdminPost {
  id: string;
  anonymousName: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
  replyCount: number;
}

interface AdminReply {
  id: string;
  anonymousName: string;
  content: string;
  status: string;
  createdAt: string;
  post: {
    id: string;
    anonymousName: string;
    category: string;
    content: string;
  };
}

interface ContactInfoEntry {
  id: string;
  key: string;
  value: string;
  label: string;
  icon: string;
  order: number;
}

interface Summary {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

// ─── Status config ───────────────────────────────────

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-safe-amber/15 text-safe-amber border-safe-amber/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-safe-green/15 text-safe-green border-safe-green/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive border-destructive/20",
  },
};

const AUTH_KEY = "safespace_admin_auth";

function getStoredAuth(): { secret: string; admin: AdminUser } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredAuth(secret: string, admin: AdminUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ secret, admin }));
}

function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Component ───────────────────────────────────────

export function AdminPanel() {
  const { triggerRefresh } = useStore();
  const [auth, setAuth] = useState<{ secret: string; admin: AdminUser } | null>(null);
  const [loginSecret, setLoginSecret] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Posts state
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsSummary, setPostsSummary] = useState<Summary | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);

  // Replies state
  const [replies, setReplies] = useState<AdminReply[]>([]);
  const [repliesSummary, setRepliesSummary] = useState<Summary | null>(null);
  const [repliesLoading, setRepliesLoading] = useState(true);

  // Admins state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", secret: "", phone: "" });

  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfoEntry[]>([]);
  const [contactLoading, setContactLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Auth ──────────────────────────────────────────

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setAuth(stored);
    }
  }, []);

  const handleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: loginSecret }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || "Invalid credentials");
        return;
      }
      const authData = { secret: loginSecret, admin: data.admin };
      setAuth(authData);
      setStoredAuth(loginSecret, data.admin);
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setLoginSecret("");
    clearStoredAuth();
    setPosts([]);
    setReplies([]);
    setAdmins([]);
    setContactInfo([]);
  };

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth?.secret}`,
  }), [auth?.secret]);

  // ─── Fetch functions ───────────────────────────────

  const fetchPosts = useCallback(async () => {
    if (!auth) return;
    setPostsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/posts", {
        headers: { Authorization: `Bearer ${auth.secret}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts);
      setPostsSummary(data.summary);
    } catch {
      setError("Unable to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, [auth]);

  const fetchReplies = useCallback(async () => {
    if (!auth) return;
    setRepliesLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/replies", {
        headers: { Authorization: `Bearer ${auth.secret}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReplies(data.replies);
      setRepliesSummary(data.summary);
    } catch {
      setError("Unable to load replies.");
    } finally {
      setRepliesLoading(false);
    }
  }, [auth]);

  const fetchAdmins = useCallback(async () => {
    if (!auth || auth.admin.role !== "superadmin") return;
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        headers: { Authorization: `Bearer ${auth.secret}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAdmins(data.admins);
    } catch {
      // silently fail
    } finally {
      setAdminsLoading(false);
    }
  }, [auth]);

  const fetchContactInfo = useCallback(async () => {
    if (!auth) return;
    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact-info", {
        headers: { Authorization: `Bearer ${auth.secret}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setContactInfo(data.entries);
    } catch {
      // silently fail
    } finally {
      setContactLoading(false);
    }
  }, [auth]);

  // Load data when auth changes or tab changes
  useEffect(() => {
    if (!auth) return;
    fetchPosts();
    fetchReplies();
    fetchAdmins();
    fetchContactInfo();
  }, [auth, fetchPosts, fetchReplies, fetchAdmins, fetchContactInfo]);

  // ─── Actions ───────────────────────────────────────

  const handlePostAction = async (postId: string, status: "approved" | "rejected") => {
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Action failed");
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status } : p))
      );
      setPostsSummary((prev) =>
        prev
          ? {
              ...prev,
              pending: status === "approved" || status === "rejected" ? Math.max(0, prev.pending - 1) : prev.pending,
              approved: status === "approved" ? prev.approved + 1 : prev.approved,
              rejected: status === "rejected" ? prev.rejected + 1 : prev.rejected,
            }
          : prev
      );
      triggerRefresh();
    } catch {
      setError("Failed to update post status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReplyAction = async (replyId: string, status: "approved" | "rejected") => {
    setActionLoading(replyId);
    try {
      const res = await fetch(`/api/admin/replies/${replyId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Action failed");
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? { ...r, status } : r))
      );
      setRepliesSummary((prev) =>
        prev
          ? {
              ...prev,
              pending: Math.max(0, prev.pending - 1),
              approved: status === "approved" ? prev.approved + 1 : prev.approved,
              rejected: status === "rejected" ? prev.rejected + 1 : prev.rejected,
            }
          : prev
      );
      triggerRefresh();
    } catch {
      setError("Failed to update reply status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.secret) return;
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newAdmin),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add admin");
        return;
      }
      setNewAdmin({ name: "", email: "", secret: "", phone: "" });
      setShowAddAdmin(false);
      fetchAdmins();
    } catch {
      setError("Failed to add admin.");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to remove admin");
        return;
      }
      fetchAdmins();
    } catch {
      setError("Failed to remove admin.");
    }
  };

  const handleSaveContactInfo = async () => {
    setActionLoading("contact-info");
    try {
      const res = await fetch("/api/admin/contact-info", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ entries: contactInfo }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setContactInfo(data.entries);
    } catch {
      setError("Failed to save contact info.");
    } finally {
      setActionLoading(null);
    }
  };

  const updateContactEntry = (index: number, field: string, value: string | number) => {
    setContactInfo((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const addContactEntry = () => {
    setContactInfo((prev) => [
      ...prev,
      { id: "", key: `new_${Date.now()}`, value: "", label: "", icon: "phone", order: prev.length },
    ]);
  };

  const removeContactEntry = (index: number) => {
    setContactInfo((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Login screen ──────────────────────────────────

  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="w-full max-w-sm rounded-xl border border-border/40 bg-card/80 p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Admin Login</h2>
            <p className="text-xs text-muted-foreground">
              Enter your admin secret to access the dashboard
            </p>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter admin secret..."
              value={loginSecret}
              onChange={(e) => setLoginSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-background"
            />
            {loginError && (
              <p className="text-xs text-destructive text-center">{loginError}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={loginLoading || !loginSecret}
              className="w-full"
            >
              {loginLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Summary stats component ───────────────────────

  const SummaryCards = ({ summary }: { summary: Summary | null }) => {
    if (!summary) return null;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: summary.total, className: "text-foreground" },
          { label: "Pending", value: summary.pending, className: "text-safe-amber" },
          { label: "Approved", value: summary.approved, className: "text-safe-green" },
          { label: "Rejected", value: summary.rejected, className: "text-destructive" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/40 bg-card/80 p-3 text-center"
          >
            <p className={`text-xl font-bold ${stat.className}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  };

  // ─── Main panel ────────────────────────────────────

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {auth.admin.name} ({auth.admin.email})
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-border/50 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="posts" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Replies
          </TabsTrigger>
          {auth.admin.role === "superadmin" && (
            <TabsTrigger value="admins" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Admins
            </TabsTrigger>
          )}
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* ── Posts Tab ────────────────────────────── */}
        <TabsContent value="posts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Post Moderation</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPosts}
              className="border-border/50 text-muted-foreground hover:text-foreground h-8"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <SummaryCards summary={postsSummary} />

          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-card/80 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-card/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {posts.map((post) => {
                const status = statusConfig[post.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={post.id}
                    className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{post.anonymousName}</span>
                        <Badge variant="outline" className={`text-[11px] ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.category} · {post.replyCount} replies
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground/80 line-clamp-3">
                      {post.content}
                    </p>
                    {post.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handlePostAction(post.id, "approved")}
                          disabled={actionLoading === post.id}
                          className="bg-safe-green/15 text-safe-green border border-safe-green/20 hover:bg-safe-green/25 h-8"
                        >
                          {actionLoading === post.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePostAction(post.id, "rejected")}
                          disabled={actionLoading === post.id}
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 h-8"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Replies Tab ──────────────────────────── */}
        <TabsContent value="replies" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Reply Moderation</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReplies}
              className="border-border/50 text-muted-foreground hover:text-foreground h-8"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <SummaryCards summary={repliesSummary} />

          {repliesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-card/80 p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : replies.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-card/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {replies.map((reply) => {
                const status = statusConfig[reply.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{reply.anonymousName}</span>
                        <Badge variant="outline" className={`text-[11px] ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Replying to <span className="text-primary">{reply.post.anonymousName}</span>
                      </span>
                    </div>

                    {/* Original post preview */}
                    <div className="rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-xs text-muted-foreground line-clamp-1">{reply.post.content}</p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-foreground/80">
                      {reply.content}
                    </p>

                    {reply.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleReplyAction(reply.id, "approved")}
                          disabled={actionLoading === reply.id}
                          className="bg-safe-green/15 text-safe-green border border-safe-green/20 hover:bg-safe-green/25 h-8"
                        >
                          {actionLoading === reply.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReplyAction(reply.id, "rejected")}
                          disabled={actionLoading === reply.id}
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 h-8"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Admins Tab ───────────────────────────── */}
        {auth.admin.role === "superadmin" && (
          <TabsContent value="admins" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Manage Admins ({admins.length})
              </h3>
              <Button
                size="sm"
                onClick={() => setShowAddAdmin(!showAddAdmin)}
                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 h-8"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Admin
              </Button>
            </div>

            {/* Add admin form */}
            {showAddAdmin && (
              <div className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">New Admin</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Secret (password)"
                    type="password"
                    value={newAdmin.secret}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, secret: e.target.value }))}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Phone (optional)"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, phone: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddAdmin}
                    disabled={!newAdmin.name || !newAdmin.email || !newAdmin.secret}
                    className="bg-safe-green/15 text-safe-green border border-safe-green/20 hover:bg-safe-green/25 h-8"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddAdmin(false)}
                    className="h-8 text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {adminsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/80 p-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((adminUser) => (
                  <div
                    key={adminUser.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-card/80 p-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {adminUser.name}
                        </p>
                        {adminUser.role === "superadmin" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-safe-amber/15 text-safe-amber border-safe-amber/20"
                          >
                            Super
                          </Badge>
                        )}
                        {adminUser.id === auth.admin.id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
                      {adminUser.phone && (
                        <p className="text-xs text-muted-foreground/60">{adminUser.phone}</p>
                      )}
                    </div>
                    {adminUser.id !== auth.admin.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAdmin(adminUser.id)}
                        className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ── Settings Tab ─────────────────────────── */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Contact Info</h3>
            <Button
              size="sm"
              onClick={addContactEntry}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Entry
            </Button>
          </div>

          {contactLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {contactInfo.map((entry, index) => (
                  <div
                    key={entry.id || entry.key}
                    className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">{entry.key}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeContactEntry(index)}
                        className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 h-6 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Label"
                        value={entry.label}
                        onChange={(e) => updateContactEntry(index, "label", e.target.value)}
                        className="bg-background h-8 text-sm"
                      />
                      <Input
                        placeholder="Value"
                        value={entry.value}
                        onChange={(e) => updateContactEntry(index, "value", e.target.value)}
                        className="bg-background h-8 text-sm"
                      />
                      <Input
                        placeholder="Icon name (lucide)"
                        value={entry.icon}
                        onChange={(e) => updateContactEntry(index, "icon", e.target.value)}
                        className="bg-background h-8 text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Order"
                        value={entry.order}
                        onChange={(e) => updateContactEntry(index, "order", parseInt(e.target.value) || 0)}
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveContactInfo}
                disabled={actionLoading === "contact-info"}
                className="w-full"
              >
                {actionLoading === "contact-info" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Contact Info
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
