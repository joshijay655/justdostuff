"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CalendarDays,
  Clock,
  Users,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { Availability } from "@/types/database";

interface BookingDialogProps {
  experienceId: string;
  providerId: string;
  experienceTitle: string;
  price: number;
  requiresNda: boolean;
}

export function BookingDialog({
  experienceId,
  providerId,
  experienceTitle,
  price,
  requiresNda,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const loadSlots = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to book");
      setOpen(false);
      router.push("/login");
      return;
    }

    setUserId(user.id);

    // Load user's emergency contact info
    const { data: profile } = await supabase
      .from("profiles")
      .select("emergency_contact_name, emergency_contact_phone")
      .eq("id", user.id)
      .single();

    if (profile) {
      setEmergencyName(profile.emergency_contact_name || "");
      setEmergencyPhone(profile.emergency_contact_phone || "");
    }

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("availability")
      .select("*")
      .eq("experience_id", experienceId)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (data) {
      // Only show slots that have spots available
      setSlots(data.filter((s) => s.booked_spots < s.total_spots));
    }

    setLoading(false);
  }, [supabase, experienceId, router]);

  useEffect(() => {
    if (open) {
      loadSlots();
      setStep("select");
      setSelectedSlot(null);
      setAgeConfirmed(false);
      setTosAccepted(false);
      setWaiverAccepted(false);
      setNdaAccepted(false);
    }
  }, [open, loadSlots]);

  async function handleBook() {
    if (!userId || !selectedSlot) return;

    if (!ageConfirmed || !tosAccepted || !waiverAccepted) {
      toast.error("Please accept all required agreements");
      return;
    }

    if (requiresNda && !ndaAccepted) {
      toast.error("Please accept the NDA");
      return;
    }

    if (!emergencyName || !emergencyPhone) {
      toast.error("Emergency contact is required");
      return;
    }

    setBooking(true);

    const now = new Date().toISOString();

    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        seeker_id: userId,
        provider_id: providerId,
        experience_id: experienceId,
        availability_id: selectedSlot,
        status: "pending",
        tos_accepted_at: now,
        waiver_accepted_at: now,
        nda_accepted_at: requiresNda ? now : null,
        seeker_emergency_name: emergencyName,
        seeker_emergency_phone: emergencyPhone,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create booking");
      console.error(error);
    } else {
      toast.success("Booking request sent! The provider will confirm shortly.");
      // Send email notification to provider (fire and forget)
      if (newBooking?.id) {
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "booking_requested", bookingId: newBooking.id }),
        }).catch(() => {});
      }
      setOpen(false);
      router.push("/bookings");
    }

    setBooking(false);
  }

  const selectedSlotData = slots.find((s) => s.id === selectedSlot);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <CalendarDays className="mr-2 h-4 w-4" />
          Book This Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Select a Time Slot" : "Confirm Booking"}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? `Choose an available slot for "${experienceTitle}"`
              : "Review and confirm your booking details"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : step === "select" ? (
          <div className="space-y-3">
            {slots.length === 0 ? (
              <div className="py-6 text-center">
                <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No available slots</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back later for new availability
                </p>
              </div>
            ) : (
              <>
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedSlot === slot.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(
                            slot.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {selectedSlot === slot.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {slot.start_time.slice(0, 5)} -{" "}
                        {slot.end_time.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {slot.total_spots - slot.booked_spots} spot
                        {slot.total_spots - slot.booked_spots !== 1 ? "s" : ""}{" "}
                        left
                      </span>
                    </div>
                  </button>
                ))}

                <Button
                  className="w-full"
                  disabled={!selectedSlot}
                  onClick={() => setStep("confirm")}
                >
                  Continue
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected slot summary */}
            {selectedSlotData && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">
                  {new Date(
                    selectedSlotData.date + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedSlotData.start_time.slice(0, 5)} -{" "}
                  {selectedSlotData.end_time.slice(0, 5)}
                </p>
                {price > 0 && (
                  <p className="mt-1 font-semibold">
                    ${Number(price).toFixed(0)}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Emergency Contact</h4>
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Agreements */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Agreements</h4>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I confirm that I am at least 18 years of age *
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={(e) => setTosAccepted(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I accept the{" "}
                  <a href="/terms" target="_blank" className="text-primary underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-primary underline">
                    Privacy Policy
                  </a>{" "}
                  *
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I accept the liability waiver and acknowledge the inherent
                  risks *
                </span>
              </label>

              {requiresNda && (
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={ndaAccepted}
                    onChange={(e) => setNdaAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I accept the Non-Disclosure Agreement (NDA) and agree not
                    to share confidential information *
                  </span>
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("select")}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={booking}
                onClick={handleBook}
              >
                {booking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {booking ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
