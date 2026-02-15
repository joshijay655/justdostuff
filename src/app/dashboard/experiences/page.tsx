import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  MapPin,
  Star,
  Package,
} from "lucide-react";

export const metadata = {
  title: "My Experiences",
};

export default async function MyExperiencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Experiences</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your listed experiences
          </p>
        </div>
        <Link href="/dashboard/experiences/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Experience
          </Button>
        </Link>
      </div>

      {experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Link key={exp.id} href={`/dashboard/experiences/${exp.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-4 p-4">
                  {exp.photos && exp.photos[0] ? (
                    <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={exp.photos[0]}
                        alt={exp.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{exp.title}</h3>
                      <Badge
                        variant={
                          exp.status === "published"
                            ? "default"
                            : exp.status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {exp.status}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {exp.city}, {exp.state}
                      </span>
                      <span>
                        {exp.price > 0
                          ? `$${Number(exp.price).toFixed(0)}`
                          : "Free"}
                      </span>
                      {exp.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          {Number(exp.avg_rating).toFixed(1)} ({exp.review_count})
                        </span>
                      )}
                    </div>

                    {exp.short_description && (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {exp.short_description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No experiences yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first experience to start hosting seekers
            </p>
            <Link href="/dashboard/experiences/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Experience
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
