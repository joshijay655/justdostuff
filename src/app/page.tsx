import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Compass,
  Shield,
  Users,
  Star,
  ArrowRight,
  ChefHat,
  Monitor,
  Camera,
  Building,
  Heart,
  Hammer,
} from "lucide-react";

const categories = [
  { name: "Technology", icon: Monitor, slug: "technology-startups" },
  { name: "Culinary", icon: ChefHat, slug: "culinary-restaurants" },
  { name: "Photography", icon: Camera, slug: "photography-film" },
  { name: "Real Estate", icon: Building, slug: "real-estate" },
  { name: "Veterinary", icon: Heart, slug: "veterinary-animal-care" },
  { name: "Woodworking", icon: Hammer, slug: "woodworking-crafts" },
];

const steps = [
  {
    step: "1",
    title: "Browse Experiences",
    description:
      "Explore hundreds of hands-on experiences across industries. Filter by category, city, and duration.",
  },
  {
    step: "2",
    title: "Book a Session",
    description:
      "Pick a date and time that works for you. Accept the liability waiver and you're set.",
  },
  {
    step: "3",
    title: "Shadow & Learn",
    description:
      "Show up, shadow a professional, ask questions, and discover if this career is right for you.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Discover what it&apos;s{" "}
            <span className="text-primary">really</span> like
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Shadow professionals, explore careers, and find your passion through
            real hands-on experiences. From tech startups to culinary kitchens.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/explore" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Compass className="h-5 w-5" />
                Explore Experiences
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                Become a Provider
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Popular Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/explore?category=${cat.slug}`}>
                <Card className="h-full text-center transition-colors hover:border-primary/50">
                  <CardContent className="flex flex-col items-center gap-2 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <cat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Safe & Verified</CardTitle>
                <CardDescription>
                  All providers go through identity verification. Liability
                  waivers protect both parties.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Real Professionals</CardTitle>
                <CardDescription>
                  Shadow actual professionals in their workplace. No simulations,
                  just authentic experiences.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Star className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Community Reviewed</CardTitle>
                <CardDescription>
                  Read reviews from other seekers. Rate your experience and help
                  the community grow.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to explore?</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-90">
            Join thousands of curious people who are discovering new careers
            through hands-on experiences.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
