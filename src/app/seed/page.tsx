"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, Check, X } from "lucide-react";

const TEST_EXPERIENCES = [
  {
    title: "(TEST) Shadow a Tech Startup Founder",
    description:
      "Spend a day with a tech startup founder and see what it's really like to build a company from scratch. You'll sit in on team standups, investor calls, product reviews, and strategy sessions. Get unfiltered insights into fundraising, hiring, product-market fit, and the daily grind of startup life. Whether you're thinking about starting your own company or just curious about the startup world, this is your chance to see behind the curtain.\n\nWhat to expect:\n- Morning standup with the engineering team\n- Product roadmap review session\n- Lunch with the founding team\n- Afternoon investor prep or customer calls\n- Q&A and career advice",
    short_description:
      "Experience a full day in the life of a startup founder — standups, investor calls, and strategy sessions.",
    category_slug: "technology-startups",
    city: "San Francisco",
    state: "CA",
    price: 150,
    slot_duration: "4-6h" as const,
    max_seekers: 2,
    requires_nda: true,
    photos: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    ],
  },
  {
    title: "(TEST) Behind the Line: Restaurant Kitchen Experience",
    description:
      "Step into a professional restaurant kitchen and experience the intensity of a real dinner service. You'll work alongside our head chef through prep, learn knife skills, understand station management, and feel the rush of a live service. This isn't a cooking class — it's the real deal.\n\nYou'll learn about:\n- Kitchen brigade system and station management\n- Mise en place and professional prep techniques\n- Plating and presentation standards\n- How a kitchen communicates during service\n- Food safety and sanitation in a commercial kitchen\n\nPlease wear closed-toe shoes and be prepared to stand for the duration.",
    short_description:
      "Work alongside a head chef through real dinner service prep and execution.",
    category_slug: "culinary-restaurants",
    city: "New York",
    state: "NY",
    price: 200,
    slot_duration: "4-6h" as const,
    max_seekers: 1,
    requires_nda: false,
    photos: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
    ],
  },
  {
    title: "(TEST) Craft Brewery Tour & Brewing Session",
    description:
      "Join our master brewer for a hands-on brewing experience at our craft brewery. You'll participate in every step of the brewing process — from selecting grains and hops to mashing, boiling, fermenting, and quality control.\n\nThis isn't just a tour — you'll actually help brew a batch. Learn about:\n- Grain selection and malt profiles\n- The mashing process and water chemistry\n- Hop varieties and their impact on flavor\n- Fermentation science and yeast management\n- Quality control and tasting techniques\n- The business side of running a craft brewery\n\nIncludes tastings of our current lineup and a 6-pack to take home.",
    short_description:
      "Hands-on brewing with a master brewer — grain to glass, plus tastings.",
    category_slug: "brewing-distilling",
    city: "Portland",
    state: "OR",
    price: 95,
    slot_duration: "4-6h" as const,
    max_seekers: 4,
    requires_nda: false,
    photos: [
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
      "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&q=80",
    ],
  },
  {
    title: "(TEST) Shadow a Wildlife Veterinarian",
    description:
      "Spend a morning with a wildlife veterinarian at our animal rehabilitation center. You'll observe routine check-ups, learn about wildlife triage, and see how we rehabilitate injured animals for release back into the wild.\n\nTypical day includes:\n- Morning rounds checking on current patients\n- Observing a medical procedure or check-up\n- Learning about wildlife intake assessment\n- Understanding medication and treatment plans\n- Discussion on conservation and wildlife rehabilitation ethics\n- Tour of rehabilitation enclosures\n\nPerfect for anyone considering veterinary medicine, wildlife biology, or conservation careers. Must be comfortable around animals and in a clinical setting.",
    short_description:
      "Observe a wildlife vet at a rehab center — rounds, procedures, and conservation.",
    category_slug: "veterinary-animal-care",
    city: "Denver",
    state: "CO",
    price: 0,
    slot_duration: "2-4h" as const,
    max_seekers: 3,
    requires_nda: false,
    photos: [
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80",
      "https://images.unsplash.com/photo-1612531386530-97d8e3ee4267?w=800&q=80",
      "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&q=80",
    ],
  },
  {
    title: "(TEST) Music Production Studio Day",
    description:
      "Step into a professional recording studio and learn the art of music production. You'll work with a Grammy-nominated producer through an actual recording session — from setting up microphones to mixing and mastering.\n\nWhat you'll experience:\n- Studio setup and signal flow\n- Microphone selection and placement techniques\n- Recording vocals and live instruments\n- DAW workflow (Pro Tools / Logic Pro)\n- Mixing fundamentals: EQ, compression, reverb\n- Mastering basics for streaming platforms\n- The business of music production\n\nBring your own music project if you'd like feedback! Open to all skill levels — from complete beginners to aspiring producers.",
    short_description:
      "Work with a Grammy-nominated producer — recording, mixing, and mastering.",
    category_slug: "music-production",
    city: "Los Angeles",
    state: "CA",
    price: 250,
    slot_duration: "4-6h" as const,
    max_seekers: 2,
    requires_nda: true,
    photos: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
      "https://images.unsplash.com/photo-1519874179391-3ebc752241dd?w=800&q=80",
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
    ],
  },
];

interface Result {
  title: string;
  id?: string;
  slots?: number;
  error?: string;
}

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleSeed() {
    setSeeding(true);
    setResults([]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setResults([
        { title: "Error", error: "Not authenticated. Please log in first." },
      ]);
      setSeeding(false);
      return;
    }

    // Ensure user is a provider
    await supabase.from("profiles").update({ role: "both" }).eq("id", user.id);

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");

    if (!categories) {
      setResults([{ title: "Error", error: "Failed to fetch categories" }]);
      setSeeding(false);
      return;
    }

    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.slug, c.id])
    );

    const newResults: Result[] = [];

    for (const exp of TEST_EXPERIENCES) {
      const categoryId = categoryMap[exp.category_slug];
      if (!categoryId) {
        newResults.push({ title: exp.title, error: "Category not found" });
        continue;
      }

      const { data, error } = await supabase
        .from("experiences")
        .insert({
          provider_id: user.id,
          category_id: categoryId,
          title: exp.title,
          description: exp.description,
          short_description: exp.short_description,
          photos: exp.photos,
          city: exp.city,
          state: exp.state,
          price: exp.price,
          slot_duration: exp.slot_duration,
          max_seekers: exp.max_seekers,
          requires_nda: exp.requires_nda,
          status: "published",
        })
        .select("id")
        .single();

      if (error) {
        newResults.push({ title: exp.title, error: error.message });
      } else {
        // Add availability slots for the next ~2 weeks
        const today = new Date();
        const slots = [];
        for (let i = 1; i <= 5; i++) {
          const date = new Date(today);
          date.setDate(
            date.getDate() + i * 2 + Math.floor(Math.random() * 3)
          );
          slots.push({
            experience_id: data.id,
            date: date.toISOString().split("T")[0],
            start_time: i % 2 === 0 ? "09:00" : "13:00",
            end_time: i % 2 === 0 ? "13:00" : "17:00",
            total_spots: exp.max_seekers,
          });
        }

        await supabase.from("availability").insert(slots);
        newResults.push({ title: exp.title, id: data.id, slots: slots.length });
      }

      setResults([...newResults]);
    }

    setDone(true);
    setSeeding(false);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seed Test Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will create 5 test experiences with Unsplash photos and
            availability slots under your account. All are labeled with
            &quot;(TEST)&quot; for easy identification and cleanup later.
          </p>

          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>- Shadow a Tech Startup Founder (SF, $150, NDA)</li>
            <li>- Restaurant Kitchen Experience (NYC, $200)</li>
            <li>- Craft Brewery Brewing Session (Portland, $95)</li>
            <li>- Shadow a Wildlife Veterinarian (Denver, Free)</li>
            <li>- Music Production Studio Day (LA, $250, NDA)</li>
          </ul>

          <Button
            onClick={handleSeed}
            disabled={seeding || done}
            className="w-full"
          >
            {seeding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            {seeding
              ? "Seeding..."
              : done
                ? "Done!"
                : "Create 5 Test Experiences"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm"
                >
                  {r.error ? (
                    <X className="h-4 w-4 flex-shrink-0 text-destructive" />
                  ) : (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{r.title}</span>
                  {r.error ? (
                    <span className="flex-shrink-0 text-destructive">
                      {r.error}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-muted-foreground">
                      {r.slots} slots
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {done && (
            <div className="flex gap-2">
              <a href="/explore" className="flex-1">
                <Button variant="outline" className="w-full">
                  View on Explore
                </Button>
              </a>
              <a href="/dashboard/experiences" className="flex-1">
                <Button variant="outline" className="w-full">
                  Manage Experiences
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
