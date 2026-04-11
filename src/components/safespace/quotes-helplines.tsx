"use client";

import { useState, useCallback, useMemo } from "react";
import { CRISIS_LINE, HELPLINES, CITIES, type Helpline } from "@/lib/helplines";
import { QUOTES } from "@/lib/quotes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Phone,
  MapPin,
  Mail,
  ChevronDown,
  ChevronUp,
  Heart,
  AlertTriangle,
  Quote,
} from "lucide-react";

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function QuotesAndHelplines() {
  const [quote, setQuote] = useState(getRandomQuote);
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [expandedCities, setExpandedCities] = useState<Set<string>>(
    new Set(["Lusaka"])
  );

  const refreshQuote = useCallback(() => {
    setQuote(getRandomQuote());
  }, []);

  const filteredHelplines = useMemo(() => {
    if (cityFilter === "All") return HELPLINES;
    return HELPLINES.filter((h) => h.city === cityFilter);
  }, [cityFilter]);

  // Group helplines by city
  const groupedHelplines = useMemo(() => {
    const groups: Record<string, Helpline[]> = {};
    filteredHelplines.forEach((h) => {
      if (!groups[h.city]) groups[h.city] = [];
      groups[h.city].push(h);
    });
    return groups;
  }, [filteredHelplines]);

  const toggleCity = (city: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
      } else {
        next.add(city);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Inspirational Quote */}
      <div className="rounded-xl border border-border/40 bg-card/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">
              Words of Encouragement
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuote}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <blockquote className="space-y-2">
          <p className="text-sm leading-relaxed text-foreground/80 italic">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="text-xs text-muted-foreground">
            — {quote.author}
          </footer>
        </blockquote>
      </div>

      {/* Crisis Line */}
      <div className="rounded-xl border-2 border-safe-rose/30 bg-safe-rose/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safe-rose/15">
            <AlertTriangle className="h-5 w-5 text-safe-rose" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-safe-rose">
              Get Help Now
            </h3>
            <p className="text-xs text-muted-foreground">
              If you or someone you know is in crisis
            </p>
          </div>
        </div>
        <a
          href={`tel:${CRISIS_LINE.phone}`}
          className="flex items-center gap-3 rounded-lg bg-safe-rose/10 p-4 transition-colors hover:bg-safe-rose/15"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safe-rose/20">
            <Phone className="h-6 w-6 text-safe-rose" />
          </div>
          <div>
            <p className="text-lg font-bold text-safe-rose">
              {CRISIS_LINE.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {CRISIS_LINE.name} — {CRISIS_LINE.description}
            </p>
          </div>
        </a>
      </div>

      {/* City Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">
            Mental Health Resources
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <Button
              key={city}
              variant={cityFilter === city ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCityFilter(city)}
              className={
                cityFilter === city
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }
            >
              {city}
              {city !== "All" && (
                <span className="ml-1 text-xs opacity-60">
                  ({HELPLINES.filter((h) => h.city === city).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Helplines grouped by city */}
      <div className="space-y-3">
        {Object.entries(groupedHelplines).length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/80 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No resources found for this filter.
            </p>
          </div>
        ) : (
          Object.entries(groupedHelplines).map(([city, helplines]) => (
            <div
              key={city}
              className="rounded-xl border border-border/40 bg-card/80 overflow-hidden"
            >
              {/* City header — collapsible */}
              <button
                onClick={() => toggleCity(city)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {city}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    {helplines.length}
                  </Badge>
                </div>
                {expandedCities.has(city) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Helpline cards */}
              {expandedCities.has(city) && (
                <div className="border-t border-border/30 divide-y divide-border/20">
                  {helplines.map((helpline) => (
                    <div
                      key={helpline.name}
                      className="p-4 space-y-2 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground leading-tight">
                          {helpline.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] bg-safe-sage/10 text-safe-sage border-safe-sage/20 whitespace-nowrap"
                        >
                          {helpline.type}
                        </Badge>
                      </div>

                      {/* Phone numbers */}
                      {helpline.phones.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {helpline.phones.map((phone) => (
                            <a
                              key={phone}
                              href={`tel:${phone.replace(/\s/g, "")}`}
                              className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                            >
                              <Phone className="h-3 w-3" />
                              {phone}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Location */}
                      {helpline.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {helpline.location}
                        </div>
                      )}

                      {/* Email */}
                      {helpline.email && (
                        <a
                          href={`mailto:${helpline.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {helpline.email}
                        </a>
                      )}

                      {/* No phone indicator */}
                      {helpline.phones.length === 0 && !helpline.email && (
                        <p className="text-xs text-muted-foreground italic">
                          Contact in person at the location above
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
