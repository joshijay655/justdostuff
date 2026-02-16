import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { BookingActions } from "@/components/booking-actions";
import { ReviewDialog } from "@/components/review-dialog";
import { MessageButton } from "@/components/message-button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800",
};

export const metadata = {
  title: "My Bookings",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all bookings with experience and availability info
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, experiences(id, title, city, state), availability(date, start_time, end_time)"
    )
    .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Fetch existing reviews by this user to know which bookings already have reviews
  const { data: userReviews } = await supabase
    .from("reviews")
    .select("booking_id")
    .eq("reviewer_id", user.id);

  const reviewedBookingIds = new Set(
    userReviews?.map((r) => r.booking_id) || []
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Bookings</h1>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: Record<string, unknown>) => {
            const exp = booking.experiences as {
              id: string;
              title: string;
              city: string;
              state: string;
            } | null;
            const avail = booking.availability as {
              date: string;
              start_time: string;
              end_time: string;
            } | null;
            const isProvider = booking.provider_id === user.id;
            const isSeeker = booking.seeker_id === user.id;
            const status = booking.status as string;
            const hasReviewed = reviewedBookingIds.has(
              booking.id as string
            );

            return (
              <Card key={booking.id as string}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/experiences/${exp?.id}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-base sm:text-lg line-clamp-1">
                          {exp?.title || "Experience"}
                        </CardTitle>
                      </Link>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {exp?.city}, {exp?.state}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {isProvider ? "As Provider" : "As Seeker"}
                      </Badge>
                      <Badge
                        className={statusColors[status] || ""}
                      >
                        {status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {avail && (
                      <>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(
                            avail.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {avail.start_time.slice(0, 5)} -{" "}
                          {avail.end_time.slice(0, 5)}
                        </span>
                      </>
                    )}
                    <span>
                      Booked{" "}
                      {new Date(
                        booking.created_at as string
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Provider actions for pending bookings */}
                  {isProvider && status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <BookingActions
                        bookingId={booking.id as string}
                        action="confirm"
                      />
                      <BookingActions
                        bookingId={booking.id as string}
                        action="decline"
                      />
                    </div>
                  )}

                  {/* Message button for confirmed/in_progress/completed bookings */}
                  {(status === "confirmed" || status === "in_progress" || status === "completed") && (
                    <div className="mt-3 flex gap-2">
                      <MessageButton
                        bookingId={booking.id as string}
                        seekerId={booking.seeker_id as string}
                        providerId={booking.provider_id as string}
                      />
                    </div>
                  )}

                  {/* Review button for completed bookings */}
                  {status === "completed" && !hasReviewed && exp && (
                    <div className="mt-3">
                      <ReviewDialog
                        bookingId={booking.id as string}
                        experienceId={exp.id}
                        reviewerId={user.id}
                        revieweeId={
                          isSeeker
                            ? (booking.provider_id as string)
                            : (booking.seeker_id as string)
                        }
                        experienceTitle={exp.title}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No bookings yet</h3>
          <p className="mt-2 text-muted-foreground">
            Explore experiences and book your first session!
          </p>
          <Link
            href="/explore"
            className="mt-4 text-primary hover:underline"
          >
            Browse experiences
          </Link>
        </div>
      )}
    </div>
  );
}
