import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Search, SlidersHorizontal, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata = {
  title: "Explore Experiences",
  description: "Browse hands-on experiences across industries",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
    duration?: string;
  }>;
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
    .eq("status", "published");

  // Category filter
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

  // Text search — search across title and description
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%,city.ilike.%${params.q}%`
    );
  }

  // Price filters
  if (params.minPrice) {
    const min = parseFloat(params.minPrice);
    if (!isNaN(min)) query = query.gte("price", min);
  }
  if (params.maxPrice) {
    const max = parseFloat(params.maxPrice);
    if (!isNaN(max)) query = query.lte("price", max);
  }

  // City filter
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }

  // Duration filter
  if (params.duration) {
    query = query.eq("slot_duration", params.duration);
  }

  // Sorting
  const sortOption = params.sort || "newest";
  switch (sortOption) {
    case "price_low":
      query = query.order("price", { ascending: true });
      break;
    case "price_high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: experiences } = await query;

  // Build current params for filter links
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides };
    const searchParts: string[] = [];
    for (const [key, val] of Object.entries(merged)) {
      if (val) searchParts.push(`${key}=${encodeURIComponent(val)}`);
    }
    return `/explore${searchParts.length > 0 ? "?" + searchParts.join("&") : ""}`;
  }

  // Get unique cities from experiences for the city suggestion
  const hasActiveFilters = params.minPrice || params.maxPrice || params.city || params.duration;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore Experiences</h1>
        <p className="mt-2 text-muted-foreground">
          Find professionals to shadow and learn from
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            {/* Preserve other params */}
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
            {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
            {params.city && <input type="hidden" name="city" value={params.city} />}
            {params.duration && <input type="hidden" name="duration" value={params.duration} />}
            <Input
              name="q"
              placeholder="Search by title, description, or city..."
              defaultValue={params.q || ""}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sort:</span>
          <div className="flex gap-1">
            {[
              { value: "newest", label: "Newest" },
              { value: "price_low", label: "Price ↑" },
              { value: "price_high", label: "Price ↓" },
              { value: "rating", label: "Top Rated" },
            ].map((opt) => (
              <a key={opt.value} href={buildUrl({ sort: opt.value })}>
                <Badge
                  variant={sortOption === opt.value ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                >
                  {opt.label}
                </Badge>
              </a>
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Price */}
        <form className="flex items-center gap-1.5">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          {params.city && <input type="hidden" name="city" value={params.city} />}
          {params.duration && <input type="hidden" name="duration" value={params.duration} />}
          <span className="text-xs font-medium text-muted-foreground">Price:</span>
          <Input
            name="minPrice"
            type="number"
            placeholder="Min"
            defaultValue={params.minPrice || ""}
            className="h-7 w-16 text-xs"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            name="maxPrice"
            type="number"
            placeholder="Max"
            defaultValue={params.maxPrice || ""}
            className="h-7 w-16 text-xs"
          />
          <button type="submit" className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90">
            Go
          </button>
        </form>

        <div className="h-4 w-px bg-border" />

        {/* Duration */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duration:</span>
          <div className="flex gap-1">
            <a href={buildUrl({ duration: undefined })}>
              <Badge variant={!params.duration ? "default" : "outline"} className="cursor-pointer text-xs">All</Badge>
            </a>
            <a href={buildUrl({ duration: "2-4h" })}>
              <Badge variant={params.duration === "2-4h" ? "default" : "outline"} className="cursor-pointer text-xs">2-4h</Badge>
            </a>
            <a href={buildUrl({ duration: "4-6h" })}>
              <Badge variant={params.duration === "4-6h" ? "default" : "outline"} className="cursor-pointer text-xs">4-6h</Badge>
            </a>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <>
            <div className="h-4 w-px bg-border" />
            <a href={buildUrl({ minPrice: undefined, maxPrice: undefined, city: undefined, duration: undefined })} className="text-xs text-red-500 hover:underline">
              Clear filters
            </a>
          </>
        )}
      </div>

      {/* Category Pills */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a href={buildUrl({ category: undefined })}>
            <Badge
              variant={!params.category ? "default" : "outline"}
              className="cursor-pointer"
            >
              All
            </Badge>
          </a>
          {categories.map((cat) => (
            <a key={cat.id} href={buildUrl({ category: cat.slug })}>
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

      {/* Results count */}
      {experiences && (
        <p className="mb-4 text-sm text-muted-foreground">
          {experiences.length} experience{experiences.length !== 1 ? "s" : ""} found
          {params.q && <> for &ldquo;{params.q}&rdquo;</>}
        </p>
      )}

      {/* Results */}
      {experiences && experiences.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <Link key={exp.id} href={`/experiences/${exp.id}`}>
              <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                {exp.photos && exp.photos[0] ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={exp.photos[0]}
                      alt={exp.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Compass className="h-8 w-8 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{exp.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {exp.short_description || exp.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {exp.city}, {exp.state}
                    </span>
                    <span className="font-semibold text-primary">
                      {exp.price > 0 ? `$${exp.price}` : "Free"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {exp.avg_rating > 0 ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">
                            {exp.avg_rating.toFixed(1)}
                          </span>
                          <span>({exp.review_count})</span>
                        </>
                      ) : (
                        <span>No reviews yet</span>
                      )}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {exp.slot_duration}
                    </Badge>
                  </div>
                  {exp.requires_nda && (
                    <Badge variant="outline" className="mt-2 text-[10px] text-amber-600 border-amber-300">
                      NDA Required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Compass className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No experiences found</h3>
          <p className="mt-2 text-muted-foreground">
            {params.q || hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Be the first to list an experience! Sign up as a provider to get started."}
          </p>
          {(params.q || hasActiveFilters) && (
            <a href="/explore" className="mt-4 text-primary hover:underline">
              Clear all filters
            </a>
          )}
        </div>
      )}
    </div>
  );
}
