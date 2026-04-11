"use client";

import { useStore } from "@/lib/store";
import { Header } from "@/components/safespace/header";
import { DisclaimerBanner } from "@/components/safespace/disclaimer-banner";
import { PostForm } from "@/components/safespace/post-form";
import { Feed } from "@/components/safespace/feed";
import { PostDetail } from "@/components/safespace/post-detail";
import { AdminPanel } from "@/components/safespace/admin-panel";
import { QuotesAndHelplines } from "@/components/safespace/quotes-helplines";
import { WhatsAppFloatingButton } from "@/components/safespace/whatsapp-button";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <AnimatePresence mode="wait">
            {currentView === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Welcome Section */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    You&apos;re not alone
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    SafeSpace is a safe, anonymous community where you can share
                    what you&apos;re going through — whether it&apos;s
                    relationships, anxiety, depression, stress, or anything
                    affecting your mental wellbeing. No accounts needed. Just
                    you, your story, and people who understand.
                  </p>
                </div>

                {/* Post Form */}
                <PostForm />

                {/* Feed */}
                <Feed />
              </motion.div>
            )}

            {currentView === "post-detail" && (
              <motion.div
                key="post-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <PostDetail />
              </motion.div>
            )}

            {currentView === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Resources Header */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Resources &amp; Support
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    You don&apos;t have to face this alone. Here are helplines,
                    mental health resources, and words of encouragement to support
                    your journey.
                  </p>
                </div>

                {/* Quotes & Helplines */}
                <QuotesAndHelplines />
              </motion.div>
            )}

            {currentView === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <AdminPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-auto">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            SafeSpace — A peer support community. Not a substitute for professional help.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            If you or someone you know is in crisis, call <strong>933</strong> (Lifeline Zambia) or contact a local helpline or emergency services.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
