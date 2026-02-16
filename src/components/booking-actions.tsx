"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface BookingActionsProps {
  bookingId: string;
  action: "confirm" | "decline";
}

export function BookingActions({ bookingId, action }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAction() {
    setLoading(true);

    const newStatus = action === "confirm" ? "confirmed" : "declined";

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error(`Failed to ${action} booking`);
    } else {
      toast.success(
        action === "confirm"
          ? "Booking confirmed!"
          : "Booking declined"
      );
      // Send email notification to seeker (fire and forget)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: action === "confirm" ? "booking_confirmed" : "booking_declined",
          bookingId,
        }),
      }).catch(() => {});
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Button
      variant={action === "confirm" ? "default" : "outline"}
      size="sm"
      disabled={loading}
      onClick={handleAction}
    >
      {loading ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : action === "confirm" ? (
        <Check className="mr-1 h-3.5 w-3.5" />
      ) : (
        <X className="mr-1 h-3.5 w-3.5" />
      )}
      {action === "confirm" ? "Confirm" : "Decline"}
    </Button>
  );
}
