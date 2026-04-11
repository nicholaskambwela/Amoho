"use client";

import { useStore } from "@/lib/store";
import { Shield, Menu, X, MessageCircleHeart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

const navItems = [
  { view: "feed" as const, label: "Community Feed", icon: MessageCircleHeart },
  { view: "resources" as const, label: "Resources", icon: Heart },
  { view: "admin" as const, label: "Admin", icon: Shield },
];

export function Header() {
  const { currentView, setView } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (view: "feed" | "resources" | "admin") => {
    setView(view);
    setMobileOpen(false);
  };

  const handleLogoClick = () => {
    setView("feed");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight text-foreground">
                SafeSpace
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                Mental Health Support
              </span>
            </div>
          </button>

          {/* Desktop Nav + Theme Toggle */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.view}
                variant={currentView === item.view ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleNavClick(item.view)}
                className={
                  currentView === item.view
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <div className="ml-1 border-l border-border/50 pl-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: Theme Toggle + Menu Toggle */}
          <div className="flex items-center gap-0.5 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="border-t border-border/50 py-3 md:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.view}
                  variant={currentView === item.view ? "secondary" : "ghost"}
                  className={
                    currentView === item.view
                      ? "justify-start bg-primary/10 text-primary hover:bg-primary/15"
                      : "justify-start text-muted-foreground hover:text-foreground"
                  }
                  onClick={() => handleNavClick(item.view)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
