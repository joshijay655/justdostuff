import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

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

  // Fetch all bookings where user is seeker or provider
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, experiences(title, city, state)")
    .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Bookings</h1>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: Record<string, unknown>) => {
            const exp = booking.experiences as {
              title: string;
              city: string;
              state: string;
            } | null;
            return (
              <Card key={booking.id as string}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {exp?.title || "Experience"}
                    </CardTitle>
                    <CardDescription>
                      {exp?.city}, {exp?.state}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      statusColors[booking.status as string] || ""
                    }
                  >
                    {(booking.status as string).replace("_", " ")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Booked on{" "}
                    {new Date(
                      booking.created_at as string
                    ).toLocaleDateString()}
                  </p>
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
        </div>
      )}
    </div>
  );
}
