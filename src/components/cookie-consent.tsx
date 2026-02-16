"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to avoid layout shift on load
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use essential cookies only for authentication and session management.
          No tracking or advertising cookies are used.{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
        </p>
        <Button onClick={handleAccept} size="sm" className="shrink-0">
          Got it
        </Button>
      </div>
    </div>
  );
}
