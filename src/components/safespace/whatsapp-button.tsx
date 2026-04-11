"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppFloatingButton() {
  const handleClick = () => {
    const message = encodeURIComponent(
      "Check out SafeSpace — a safe, anonymous space to share what you're going through and find peer support."
    );
    const number = "+260XXXXXXXXX";
    window.open(`https://wa.me/${number.replace(/[^0-9+]/g, "")}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/15 transition-all hover:bg-[#20BA5A] hover:shadow-xl hover:shadow-[#25D366]/25 md:h-12 md:w-12"
      aria-label="Share SafeSpace on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 md:h-5 md:w-5" />
    </Button>
  );
}
