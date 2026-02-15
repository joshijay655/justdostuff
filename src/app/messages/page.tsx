"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface ConversationWithDetails {
  id: string;
  booking_id: string;
  seeker_id: string;
  provider_id: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  experience_title: string;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadConversations() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Fetch conversations where user is participant
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!convos || convos.length === 0) {
        setLoading(false);
        return;
      }

      // For each conversation, get other user's profile, experience title, last message, and unread count
      const enriched: ConversationWithDetails[] = [];

      for (const convo of convos) {
        const otherUserId = convo.seeker_id === user.id ? convo.provider_id : convo.seeker_id;

        // Get other user profile
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        // Get booking + experience title
        const { data: booking } = await supabase
          .from("bookings")
          .select("experience_id, experiences(title)")
          .eq("id", convo.booking_id)
          .single();

        // Get last message
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convo.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        const expData = booking?.experiences as unknown;
        const exp = (Array.isArray(expData) ? expData[0] : expData) as { title: string } | null;

        enriched.push({
          ...convo,
          other_user: otherProfile || { id: otherUserId, full_name: "Unknown User", avatar_url: null },
          experience_title: exp?.title || "Experience",
          last_message: lastMsg || null,
          unread_count: count || 0,
        });
      }

      // Sort by last message date (newest first)
      enriched.sort((a, b) => {
        const dateA = a.last_message?.created_at || a.created_at;
        const dateB = b.last_message?.created_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setConversations(enriched);
      setLoading(false);
    }

    loadConversations();
  }, [supabase, router]);

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Messages</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Messages</h1>

      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((convo) => {
            const initials = convo.other_user.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link key={convo.id} href={`/messages/${convo.id}`}>
                <Card className={`transition-colors hover:border-primary/50 ${convo.unread_count > 0 ? "border-primary/30 bg-primary/5" : ""}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.other_user.avatar_url || undefined} />
                      <AvatarFallback>{initials || "?"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm truncate ${convo.unread_count > 0 ? "font-bold" : "font-medium"}`}>
                          {convo.other_user.full_name || "Unknown User"}
                        </h3>
                        {convo.last_message && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(convo.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.experience_title}
                      </p>
                      {convo.last_message ? (
                        <p className={`text-sm truncate mt-0.5 ${convo.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                          {convo.last_message.sender_id === userId ? "You: " : ""}
                          {convo.last_message.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          No messages yet — say hello!
                        </p>
                      )}
                    </div>

                    {convo.unread_count > 0 && (
                      <Badge className="rounded-full px-2 py-0.5 text-xs">
                        {convo.unread_count}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No conversations yet</h3>
          <p className="mt-2 text-muted-foreground">
            Conversations are created when a booking is made. Book an experience to start chatting!
          </p>
          <Link href="/explore" className="mt-4 text-primary hover:underline">
            Browse experiences
          </Link>
        </div>
      )}
    </div>
  );
}
