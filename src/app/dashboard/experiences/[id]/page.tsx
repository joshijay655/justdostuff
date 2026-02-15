"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Experience, Availability } from "@/types/database";

export default function ManageExperiencePage() {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New slot form
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("13:00");
  const [newSpots, setNewSpots] = useState("1");

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch experience
    const { data: exp } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .eq("provider_id", user.id)
      .single();

    if (!exp) {
      toast.error("Experience not found");
      router.push("/dashboard/experiences");
      return;
    }

    setExperience(exp);

    // Fetch availability slots
    const { data: avail } = await supabase
      .from("availability")
      .select("*")
      .eq("experience_id", id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (avail) setSlots(avail);
    setLoading(false);
  }, [supabase, router, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();

    if (!newDate) {
      toast.error("Please select a date");
      return;
    }

    if (newStartTime >= newEndTime) {
      toast.error("End time must be after start time");
      return;
    }

    setAdding(true);

    const { data, error } = await supabase
      .from("availability")
      .insert({
        experience_id: id,
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        total_spots: parseInt(newSpots) || 1,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add slot");
      console.error(error);
    } else if (data) {
      setSlots((prev) =>
        [...prev, data].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.start_time.localeCompare(b.start_time);
        })
      );
      toast.success("Time slot added");
      setNewDate("");
    }

    setAdding(false);
  }

  async function deleteSlot(slotId: string) {
    const slot = slots.find((s) => s.id === slotId);
    if (slot && slot.booked_spots > 0) {
      toast.error("Cannot delete a slot with existing bookings");
      return;
    }

    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("id", slotId);

    if (error) {
      toast.error("Failed to delete slot");
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success("Slot removed");
    }
  }

  async function toggleStatus() {
    if (!experience) return;

    const newStatus =
      experience.status === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("experiences")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      setExperience({ ...experience, status: newStatus });
      toast.success(
        newStatus === "published"
          ? "Experience published!"
          : "Experience unpublished"
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!experience) return null;

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, Availability[]>
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard/experiences"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to My Experiences
      </Link>

      {/* Experience Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{experience.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant={
                experience.status === "published" ? "default" : "secondary"
              }
            >
              {experience.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {experience.city}, {experience.state}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/experiences/${id}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {experience.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Add Time Slot */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Time Slot
          </CardTitle>
          <CardDescription>
            Add available time slots for seekers to book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSlot} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spots">Available Spots</Label>
                <Input
                  id="spots"
                  type="number"
                  min="1"
                  max={experience.max_seekers}
                  value={newSpots}
                  onChange={(e) => setNewSpots(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={adding} className="w-full">
              {adding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Slots */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Scheduled Slots ({slots.length})
        </h2>

        {slots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No time slots yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first available time slot above
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(slotsByDate).map(([date, dateSlots]) => {
              const isPast = date < today;
              return (
                <div key={date}>
                  <h3
                    className={`mb-2 text-sm font-medium ${isPast ? "text-muted-foreground" : ""}`}
                  >
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {isPast && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Past
                      </Badge>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {dateSlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className={isPast ? "opacity-60" : ""}
                      >
                        <CardContent className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {slot.start_time.slice(0, 5)} -{" "}
                              {slot.end_time.slice(0, 5)}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {slot.booked_spots} / {slot.total_spots} booked
                            </div>
                            {slot.booked_spots >= slot.total_spots && (
                              <Badge variant="destructive" className="text-xs">
                                Full
                              </Badge>
                            )}
                          </div>
                          {!isPast && slot.booked_spots === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
