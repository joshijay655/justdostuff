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
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  CalendarDays,
  Star,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";

interface BookingRow {
  status: string;
  created_at: string;
  experience_id: string;
}

interface ExperienceRow {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  status: string;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

interface ReviewRow {
  rating: number;
  created_at: string;
}

interface ConversationRow {
  id: string;
}

interface MessageRow {
  id: string;
  is_read: boolean;
}

interface AvailabilityRow {
  total_spots: number;
  booked_spots: number;
  date: string;
}

interface VerificationRow {
  status: string;
}

interface ProfileRow {
  id: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  city: string | null;
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all data in parallel for performance
  const [
    { data: profileData },
    { data: experiences },
    { data: bookings },
    { data: reviews },
    { data: conversations },
    { data: messages },
    { data: availability },
    { data: verifications },
    { data: allProfiles },
    { data: categories },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("experiences").select("id, title, price, city, state, status, avg_rating, review_count, created_at").eq("provider_id", user.id),
    supabase.from("bookings").select("status, created_at, experience_id").or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`),
    supabase.from("reviews").select("rating, created_at").eq("reviewee_id", user.id),
    supabase.from("conversations").select("id").or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`),
    supabase.from("messages").select("id, is_read"),
    supabase.from("availability").select("total_spots, booked_spots, date"),
    supabase.from("verification_requests").select("status"),
    supabase.from("profiles").select("id, role, is_verified, created_at, city"),
    supabase.from("categories").select("id, name, slug"),
  ]);

  if (!profileData) redirect("/login");

  const exp = (experiences || []) as ExperienceRow[];
  const bk = (bookings || []) as BookingRow[];
  const rev = (reviews || []) as ReviewRow[];
  const conv = (conversations || []) as ConversationRow[];
  const msg = (messages || []) as MessageRow[];
  const avail = (availability || []) as AvailabilityRow[];
  const ver = (verifications || []) as VerificationRow[];
  const profiles = (allProfiles || []) as ProfileRow[];

  // ── Computed metrics ──

  // Experience metrics
  const publishedExperiences = exp.filter(e => e.status === "published").length;
  const draftExperiences = exp.filter(e => e.status === "draft").length;
  const archivedExperiences = exp.filter(e => e.status === "archived").length;
  const totalRevenue = bk
    .filter(b => b.status === "completed")
    .reduce((sum, b) => {
      const experience = exp.find(e => e.id === b.experience_id);
      return sum + (experience?.price || 0);
    }, 0);
  const avgPrice = exp.length > 0
    ? exp.reduce((sum, e) => sum + e.price, 0) / exp.length
    : 0;

  // Booking metrics
  const totalBookings = bk.length;
  const completedBookings = bk.filter(b => b.status === "completed").length;
  const confirmedBookings = bk.filter(b => b.status === "confirmed").length;
  const pendingBookings = bk.filter(b => b.status === "pending").length;
  const cancelledBookings = bk.filter(b => b.status === "cancelled").length;
  const declinedBookings = bk.filter(b => b.status === "declined").length;
  const conversionRate = totalBookings > 0
    ? Math.round((completedBookings / totalBookings) * 100)
    : 0;

  // Review metrics
  const totalReviews = rev.length;
  const avgRating = totalReviews > 0
    ? (rev.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "N/A";
  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: rev.filter(review => review.rating === r).length,
    percentage: totalReviews > 0
      ? Math.round((rev.filter(review => review.rating === r).length / totalReviews) * 100)
      : 0,
  }));

  // Messaging metrics
  const totalConversations = conv.length;
  const totalMessages = msg.length;
  const unreadMessages = msg.filter(m => !m.is_read).length;

  // Availability / capacity metrics
  const totalSlots = avail.length;
  const totalCapacity = avail.reduce((sum, a) => sum + a.total_spots, 0);
  const totalBooked = avail.reduce((sum, a) => sum + a.booked_spots, 0);
  const utilizationRate = totalCapacity > 0
    ? Math.round((totalBooked / totalCapacity) * 100)
    : 0;
  const futureSlots = avail.filter(a => new Date(a.date) >= new Date()).length;

  // Verification status
  const verStatus = ver.length > 0 ? ver[ver.length - 1].status : "none";

  // Platform overview (admin-like view)
  const totalUsers = profiles.length;
  const providers = profiles.filter(p => p.role === "provider" || p.role === "both").length;
  const seekers = profiles.filter(p => p.role === "seeker" || p.role === "both").length;
  const verifiedUsers = profiles.filter(p => p.is_verified).length;

  // City distribution
  const cityMap = new Map<string, number>();
  exp.forEach(e => {
    const key = `${e.city}, ${e.state}`;
    cityMap.set(key, (cityMap.get(key) || 0) + 1);
  });
  const topCities = Array.from(cityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top experiences by rating
  const topExperiences = [...exp]
    .filter(e => e.review_count > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    .slice(0, 5);

  // Recent bookings (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentBookings = bk.filter(b => new Date(b.created_at) >= weekAgo).length;

  // Monthly trend (bookings per month, last 6 months)
  const monthlyBookings: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const count = bk.filter(b => b.created_at.startsWith(monthKey)).length;
    monthlyBookings.push({ month: monthLabel, count });
  }
  const maxMonthly = Math.max(...monthlyBookings.map(m => m.count), 1);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your performance, bookings, and platform metrics
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleString()}
        </Badge>
      </div>

      {/* ── KPI Cards ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              From {completedBookings} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {recentBookings} in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              From {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Booking to completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Booking Funnel + Monthly Trend ── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Booking Pipeline
            </CardTitle>
            <CardDescription>Status breakdown of all bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Completed", count: completedBookings, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-600" },
              { label: "Confirmed", count: confirmedBookings, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-600" },
              { label: "Pending", count: pendingBookings, icon: Loader2, color: "text-amber-600", bg: "bg-amber-600" },
              { label: "Declined", count: declinedBookings, icon: XCircle, color: "text-red-600", bg: "bg-red-600" },
              { label: "Cancelled", count: cancelledBookings, icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="w-24 text-sm">{item.label}</span>
                <div className="flex-1">
                  <div className="h-6 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${item.bg} transition-all`}
                      style={{
                        width: totalBookings > 0
                          ? `${Math.max((item.count / totalBookings) * 100, item.count > 0 ? 8 : 0)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Booking Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Booking Trend (6 Months)
            </CardTitle>
            <CardDescription>Monthly booking volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2" style={{ height: "180px" }}>
              {monthlyBookings.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium">{m.count}</span>
                  <div className="w-full rounded-t-md bg-muted" style={{ height: "140px", position: "relative" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-primary transition-all"
                      style={{
                        height: `${Math.max((m.count / maxMonthly) * 100, m.count > 0 ? 10 : 2)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Experiences + Reviews ── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Experience Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Your Experiences
            </CardTitle>
            <CardDescription>Listing overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{publishedExperiences}</p>
                <p className="text-xs text-green-600">Published</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{draftExperiences}</p>
                <p className="text-xs text-amber-600">Drafts</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{archivedExperiences}</p>
                <p className="text-xs text-gray-600">Archived</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Price</span>
                <span className="font-medium">${avgPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Availability Slots</span>
                <span className="font-medium">{totalSlots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Future Slots Available</span>
                <span className="font-medium">{futureSlots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity Utilization</span>
                <span className="font-medium">{utilizationRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
            <CardDescription>
              {totalReviews} total reviews — avg {avgRating} stars
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratingDistribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="flex w-12 items-center gap-1 text-sm">
                  {r.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${Math.max(r.percentage, r.count > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm text-muted-foreground">
                  {r.count} ({r.percentage}%)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Messaging + Top Experiences ── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Messaging Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Messaging Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{totalConversations}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{totalMessages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{unreadMessages}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/messages">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Go to Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Experiences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Top Rated Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExperiences.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No reviewed experiences yet
              </p>
            ) : (
              <div className="space-y-3">
                {topExperiences.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title.replace("(TEST) ", "")}</p>
                      <p className="text-xs text-muted-foreground">{e.city}, {e.state}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{e.avg_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({e.review_count})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Platform Overview + Geography ── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Platform Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Platform Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <Badge variant="secondary">{totalUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Providers</span>
              <Badge variant="outline" className="text-green-600">{providers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Seekers</span>
              <Badge variant="outline" className="text-blue-600">{seekers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified</span>
              <Badge variant="outline" className="text-purple-600">{verifiedUsers}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* City Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No experiences yet
              </p>
            ) : (
              <div className="space-y-3">
                {topCities.map(([city, count]) => (
                  <div key={city} className="flex items-center justify-between">
                    <span className="text-sm">{city}</span>
                    <Badge variant="secondary">{count} exp</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Verification & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Status</span>
              {profileData?.is_verified ? (
                <Badge className="bg-green-600">Verified</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600">
                  {verStatus === "pending" ? "Under Review" : "Unverified"}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification</span>
              <Badge variant="outline">
                {verStatus === "none" ? "Not Submitted" : verStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Compliance</span>
              <Badge className="bg-green-600">
                <Shield className="mr-1 h-3 w-3" />
                HIPAA/COPPA OK
              </Badge>
            </div>
            <div className="mt-2">
              <Link href="/dashboard/verification">
                <Button variant="outline" size="sm" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Verification Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Stats Footer ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-primary">{exp.length}</p>
              <p className="text-muted-foreground">Experiences</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
              <p className="text-muted-foreground">Bookings</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalReviews}</p>
              <p className="text-muted-foreground">Reviews</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalMessages}</p>
              <p className="text-muted-foreground">Messages</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
              <p className="text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
