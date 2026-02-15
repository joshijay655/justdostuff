import { Card, CardContent } from "@/components/ui/card";

export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded bg-muted" />
      </div>

      {/* Search skeleton */}
      <div className="mb-4 h-10 animate-pulse rounded-lg bg-muted" />

      {/* Filters skeleton */}
      <div className="mb-4 h-14 animate-pulse rounded-lg bg-muted/30" />

      {/* Category pills skeleton */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>

      {/* Results count skeleton */}
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <CardContent className="p-4 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
