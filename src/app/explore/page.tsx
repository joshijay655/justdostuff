import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Explore Experiences",
  description: "Browse hands-on experiences across industries",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch published experiences
  let query = supabase
    .from("experiences")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data: experiences } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore Experiences</h1>
        <p className="mt-2 text-muted-foreground">
          Find professionals to shadow and learn from
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="q"
              placeholder="Search experiences..."
              defaultValue={params.q || ""}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Category Pills */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a href="/explore">
            <Badge
              variant={!params.category ? "default" : "outline"}
              className="cursor-pointer"
            >
              All
            </Badge>
          </a>
          {categories.map((cat) => (
            <a key={cat.id} href={`/explore?category=${cat.slug}`}>
              <Badge
                variant={params.category === cat.slug ? "default" : "outline"}
                className="cursor-pointer"
              >
                {cat.name}
              </Badge>
            </a>
          ))}
        </div>
      )}

      {/* Results */}
      {experiences && experiences.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <a key={exp.id} href={`/experience/${exp.id}`}>
              <Card className="h-full overflow-hidden transition-colors hover:border-primary/50">
                {exp.photos && exp.photos[0] && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={exp.photos[0]}
                      alt={exp.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {exp.short_description || exp.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {exp.city}, {exp.state}
                    </span>
                    <span className="font-medium">
                      {exp.price > 0 ? `$${exp.price}` : "Free"}
                    </span>
                  </div>
                  {exp.avg_rating > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <span className="text-yellow-500">&#9733;</span>
                      {exp.avg_rating.toFixed(1)} ({exp.review_count})
                    </div>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Compass className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No experiences yet</h3>
          <p className="mt-2 text-muted-foreground">
            Be the first to list an experience! Sign up as a provider to get
            started.
          </p>
        </div>
      )}
    </div>
  );
}
