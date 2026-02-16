import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendEmail,
  bookingRequestedEmail,
  bookingConfirmedEmail,
  bookingDeclinedEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, bookingId } = body;

  if (!type || !bookingId) {
    return NextResponse.json({ error: "Missing type or bookingId" }, { status: 400 });
  }

  // Fetch booking with related data
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, experiences(title), availability(date, start_time, end_time)")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Get seeker and provider profiles
  const { data: seeker } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", booking.seeker_id)
    .single();

  const { data: provider } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", booking.provider_id)
    .single();

  if (!seeker || !provider) {
    return NextResponse.json({ error: "Users not found" }, { status: 404 });
  }

  const expData = booking.experiences as unknown;
  const exp = (Array.isArray(expData) ? expData[0] : expData) as { title: string } | null;
  const availData = booking.availability as unknown;
  const avail = (Array.isArray(availData) ? availData[0] : availData) as {
    date: string;
    start_time: string;
    end_time: string;
  } | null;

  const experienceTitle = exp?.title || "Experience";
  const date = avail
    ? new Date(avail.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "TBD";
  const time = avail
    ? `${avail.start_time.slice(0, 5)} - ${avail.end_time.slice(0, 5)}`
    : "TBD";

  const baseUrl = request.nextUrl.origin;

  try {
    switch (type) {
      case "booking_requested": {
        const email = bookingRequestedEmail({
          providerName: provider.full_name || "Provider",
          seekerName: seeker.full_name || "A seeker",
          experienceTitle,
          date,
          time,
          bookingsUrl: `${baseUrl}/bookings`,
        });
        await sendEmail({ to: provider.email, ...email });
        break;
      }

      case "booking_confirmed": {
        const email = bookingConfirmedEmail({
          seekerName: seeker.full_name || "Seeker",
          providerName: provider.full_name || "Provider",
          experienceTitle,
          date,
          time,
          bookingsUrl: `${baseUrl}/bookings`,
        });
        await sendEmail({ to: seeker.email, ...email });
        break;
      }

      case "booking_declined": {
        const email = bookingDeclinedEmail({
          seekerName: seeker.full_name || "Seeker",
          experienceTitle,
          date,
          exploreUrl: `${baseUrl}/explore`,
        });
        await sendEmail({ to: seeker.email, ...email });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notify Error]", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
