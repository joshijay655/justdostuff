"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

interface MessageButtonProps {
  bookingId: string;
  seekerId: string;
  providerId: string;
}

export function MessageButton({ bookingId, seekerId, providerId }: MessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleClick() {
    setLoading(true);

    // Check if conversation already exists for this booking
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from("conversations")
      .insert({
        booking_id: bookingId,
        seeker_id: seekerId,
        provider_id: providerId,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create conversation:", error);
      setLoading(false);
      return;
    }

    router.push(`/messages/${newConvo.id}`);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <MessageCircle className="mr-2 h-3.5 w-3.5" />
      )}
      Message
    </Button>
  );
}
