import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  Users,
  Shield,
  Star,
  ArrowLeft,
} from "lucide-react";
import { BookingDialog } from "@/components/booking-dialog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: experience } = await supabase
    .from("experiences")
    .select("title, short_description")
    .eq("id", id)
    .single();

  if (!experience) return { title: "Experience Not Found" };

  return {
    title: experience.title,
    description: experience.short_description || undefined,
  };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch experience with provider info and category
  const { data: experience } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!experience || experience.status === "archived") {
    notFound();
  }

  // Fetch provider profile
  const { data: provider } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, city, state, is_verified")
    .eq("id", experience.provider_id)
    .single();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("id", experience.category_id)
    .single();

  // Fetch reviews for this experience
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url)")
    .eq("experience_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Check if current user is the provider (to show edit options)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === experience.provider_id;

  const providerInitials = provider?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Link */}
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Explore
      </Link>

      {/* Photo Gallery */}
      {experience.photos && experience.photos.length > 0 && (
        <div className="mb-8">
          {experience.photos.length === 1 ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
              <img
                src={experience.photos[0]}
                alt={experience.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="aspect-video overflow-hidden rounded-xl sm:rounded-l-xl sm:rounded-r-none bg-muted sm:row-span-2">
                <img
                  src={experience.photos[0]}
                  alt={experience.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {experience.photos.slice(1, 3).map((photo: string, i: number) => (
                  <div
                    key={i}
                    className={`aspect-video overflow-hidden bg-muted rounded-lg ${
                      i === 0 ? "sm:rounded-tr-xl sm:rounded-lg" : "sm:rounded-br-xl sm:rounded-lg"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${experience.title} ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            {category && (
              <Link href={`/explore?category=${category.slug}`}>
                <Badge variant="secondary" className="mb-3">
                  {category.name}
                </Badge>
              </Link>
            )}
            <h1 className="text-3xl font-bold">{experience.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {experience.city}, {experience.state}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {experience.slot_duration === "2-4h"
                  ? "2 - 4 hours"
                  : "4 - 6 hours"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Up to {experience.max_seekers}{" "}
                {experience.max_seekers === 1 ? "seeker" : "seekers"}
              </span>
              {experience.requires_nda && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Shield className="h-4 w-4" />
                  NDA Required
                </span>
              )}
            </div>

            {experience.avg_rating > 0 && (
              <div className="mt-3 flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">
                  {Number(experience.avg_rating).toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({experience.review_count}{" "}
                  {experience.review_count === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">About This Experience</h2>
            <div className="whitespace-pre-wrap text-muted-foreground">
              {experience.description}
            </div>
          </div>

          {/* Reviews Section */}
          {reviews && reviews.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Reviews ({experience.review_count})
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => {
                  const reviewer = review.reviewer as {
                    full_name: string | null;
                    avatar_url: string | null;
                  } | null;
                  const reviewerInitials = reviewer?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={reviewer?.avatar_url || undefined}
                              alt={reviewer?.full_name || "Reviewer"}
                            />
                            <AvatarFallback className="text-xs">
                              {reviewerInitials || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {reviewer?.full_name || "Anonymous"}
                              </span>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < review.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {review.comment}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Booking Card */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span className="text-2xl">
                  {experience.price > 0
                    ? `$${Number(experience.price).toFixed(0)}`
                    : "Free"}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  per session
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <Link href={`/dashboard/experiences/${id}`}>
                  <Button className="w-full">Manage Experience</Button>
                </Link>
              ) : (
                <BookingDialog
                  experienceId={id}
                  providerId={experience.provider_id}
                  experienceTitle={experience.title}
                  price={Number(experience.price)}
                  requiresNda={experience.requires_nda}
                />
              )}
              <p className="text-center text-xs text-muted-foreground">
                You won&apos;t be charged until the booking is confirmed
              </p>
            </CardContent>
          </Card>

          {/* Provider Card */}
          {provider && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={provider.avatar_url || undefined}
                      alt={provider.full_name || "Provider"}
                    />
                    <AvatarFallback>
                      {providerInitials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{provider.full_name}</p>
                    {provider.city && (
                      <p className="text-sm text-muted-foreground">
                        {provider.city}
                        {provider.state ? `, ${provider.state}` : ""}
                      </p>
                    )}
                    {provider.is_verified && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-green-600"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {provider.bio && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                    {provider.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
