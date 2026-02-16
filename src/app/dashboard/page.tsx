import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Plus,
  CalendarDays,
  MessageCircle,
  Shield,
  User,
  ArrowRight,
} from "lucide-react";
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const isProvider = profile.role === "provider" || profile.role === "both";
  const isSeeker = profile.role === "seeker" || profile.role === "both";

  // Check profile completeness
  const profileFields = [
    profile.full_name,
    profile.bio,
    profile.city,
    profile.phone,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompleteness = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your JustDoStuff account.
        </p>
      </div>

      {/* Profile Completeness */}
      {profileCompleteness < 100 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">
                Complete your profile ({profileCompleteness}%)
              </p>
              <p className="text-sm text-muted-foreground">
                A complete profile helps build trust with other users.
              </p>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Role Badge */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {profile.role}
        </Badge>
        {profile.is_verified ? (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <Shield className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        ) : isProvider ? (
          <Link href="/dashboard/verification">
            <Badge variant="outline" className="text-amber-600 cursor-pointer hover:bg-amber-50">
              Unverified — Get Verified
            </Badge>
          </Link>
        ) : (
          <Badge variant="outline" className="text-amber-600">
            Unverified
          </Badge>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isSeeker && (
          <Link href="/explore" className="group">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Explore Experiences</CardTitle>
                <CardDescription>
                  Discover professionals to shadow and learn from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="flex items-center text-sm text-primary">
                  Browse experiences
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        )}

        {isProvider && (
          <Link href="/dashboard/experiences/new" className="group">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Create Experience</CardTitle>
                <CardDescription>
                  List a new experience for seekers to book
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="flex items-center text-sm text-green-600">
                  Create listing
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/bookings" className="group">
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">My Bookings</CardTitle>
              <CardDescription>
                View and manage your upcoming experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="flex items-center text-sm text-blue-600">
                View bookings
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages" className="group">
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Messages</CardTitle>
              <CardDescription>
                Chat with providers and seekers about bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="flex items-center text-sm text-purple-600">
                View conversations
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {isProvider && !profile.is_verified && (
          <Link href="/dashboard/verification" className="group">
            <Card className="h-full border-amber-200 transition-colors hover:border-amber-400">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg">Get Verified</CardTitle>
                <CardDescription>
                  Build trust with seekers and get more bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="flex items-center text-sm text-amber-600">
                  Start verification
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
