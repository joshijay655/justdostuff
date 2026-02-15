import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  CalendarDays,
  Star,
  UserPlus,
  ListPlus,
  Clock,
  CheckCircle,
  Shield,
  Heart,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">How JustDoStuff Works</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Connect with professionals, shadow their work, and gain real-world
          experience in any industry that interests you.
        </p>
      </div>

      <Separator className="my-10" />

      {/* For Seekers */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">For Seekers</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Discover</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Browse experiences across 15+ categories. Filter by industry,
              location, and price to find the perfect match.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Book</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Select an available time slot, provide emergency contact info,
              and accept the terms. The provider will confirm your booking.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Experience & Review</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Show up, learn, and immerse yourself. After your session, leave a
              review to help others discover great experiences.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Providers */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">For Providers</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <ListPlus className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>1. List</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Create a detailed listing with photos, description, pricing, and
              location. Save as draft or publish immediately.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>2. Set Availability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Add time slots when you&apos;re available. Control how many seekers
              can join each session and manage your schedule.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>3. Host & Earn</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Confirm bookings, share your expertise, and earn income doing what
              you love. Build your reputation through reviews.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-10" />

      {/* Safety & Trust */}
      <section className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Safety & Trust
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Verified Professionals</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Providers go through a verification process to ensure quality
              and safety.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Emergency Contacts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Both parties provide emergency contacts that are shared upon
              booking confirmation.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="font-semibold">Community Reviews</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Honest reviews from real participants help maintain quality and
              accountability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-muted px-8 py-12 text-center">
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Whether you want to explore new industries or share your expertise,
          JustDoStuff makes it easy.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/explore">
            <Button size="lg">
              <Search className="mr-2 h-4 w-4" />
              Explore Experiences
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Become a Provider
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
