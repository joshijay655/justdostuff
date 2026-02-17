"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, Check, X, Users, MessageCircle, Star, CalendarDays } from "lucide-react";

const TEST_EXPERIENCES = [
  {
    title: "(TEST) Shadow a Tech Startup Founder",
    description:
      "Spend a day with a tech startup founder and see what it's really like to build a company from scratch. You'll sit in on team standups, investor calls, product reviews, and strategy sessions. Get unfiltered insights into fundraising, hiring, product-market fit, and the daily grind of startup life.\n\nWhat to expect:\n- Morning standup with the engineering team\n- Product roadmap review session\n- Lunch with the founding team\n- Afternoon investor prep or customer calls\n- Q&A and career advice",
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
      "Step into a professional restaurant kitchen and experience the intensity of a real dinner service. You'll work alongside our head chef through prep, learn knife skills, understand station management, and feel the rush of a live service.\n\nYou'll learn about:\n- Kitchen brigade system and station management\n- Mise en place and professional prep techniques\n- Plating and presentation standards\n- How a kitchen communicates during service\n- Food safety and sanitation\n\nPlease wear closed-toe shoes and be prepared to stand for the duration.",
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
      "Join our master brewer for a hands-on brewing experience at our craft brewery. You'll participate in every step of the brewing process — from selecting grains and hops to mashing, boiling, fermenting, and quality control.\n\nLearn about:\n- Grain selection and malt profiles\n- The mashing process and water chemistry\n- Hop varieties and their impact on flavor\n- Fermentation science and yeast management\n- Quality control and tasting techniques\n\nIncludes tastings and a 6-pack to take home.",
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
      "Spend a morning with a wildlife veterinarian at our animal rehabilitation center. You'll observe routine check-ups, learn about wildlife triage, and see how we rehabilitate injured animals.\n\nTypical day includes:\n- Morning rounds checking on current patients\n- Observing a medical procedure or check-up\n- Learning about wildlife intake assessment\n- Understanding medication and treatment plans\n- Tour of rehabilitation enclosures\n\nMust be comfortable around animals and in a clinical setting.",
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
      "Step into a professional recording studio and learn the art of music production. You'll work with a Grammy-nominated producer through an actual recording session.\n\nWhat you'll experience:\n- Studio setup and signal flow\n- Microphone selection and placement techniques\n- Recording vocals and live instruments\n- DAW workflow (Pro Tools / Logic Pro)\n- Mixing fundamentals: EQ, compression, reverb\n- Mastering basics for streaming platforms\n\nBring your own music project if you'd like feedback!",
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

const TEST_REVIEWS = [
  { rating: 5, comment: "Absolutely incredible experience! I learned so much about the startup world. The founder was incredibly open and honest about the challenges." },
  { rating: 4, comment: "Great hands-on experience. The kitchen was intense but the chef was patient and explained everything clearly. Would definitely recommend." },
  { rating: 5, comment: "Best money I've ever spent on an experience. The brewing process was fascinating and the master brewer made it so accessible." },
  { rating: 3, comment: "Good experience overall. A bit shorter than expected but the vet was knowledgeable. Would have liked more hands-on time." },
  { rating: 5, comment: "Mind-blowing studio session! Getting to work in a real studio with pro equipment was a dream come true." },
  { rating: 4, comment: "Really eye-opening. I never realized how much goes into running a tech startup. Great networking opportunity too." },
  { rating: 5, comment: "The NDA was worth it — got to see some truly cutting-edge work. Incredible learning opportunity." },
  { rating: 4, comment: "Loved every minute. The team was welcoming and I felt like I was really part of the kitchen crew." },
];

const TEST_MESSAGES = [
  ["Hi! I'm really excited about the upcoming session. Is there anything I should prepare?", "Great question! Just bring a notebook and comfortable shoes. We'll provide everything else. Looking forward to meeting you!"],
  ["Thanks for confirming my booking! Quick question — is parking available nearby?", "Yes! There's a free parking lot right behind the building. I'll send you the address details closer to the date."],
  ["I had an amazing time today! Thank you so much for the experience.", "So glad you enjoyed it! You asked great questions. Feel free to reach out if you ever want to come back."],
  ["Just wanted to double-check the start time — is it 9 AM sharp?", "Yes, 9 AM! Please try to arrive 10 minutes early so we can get you set up. See you soon!"],
  ["Can I bring a friend who's also interested?", "Unfortunately the slot is just for one person to keep it intimate, but they can definitely book their own slot! There's availability next week."],
];

interface StepResult {
  step: string;
  status: "success" | "error" | "info";
  detail: string;
}

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState("");
  const supabase = createClient();

  function addResult(step: string, status: StepResult["status"], detail: string) {
    setResults(prev => [...prev, { step, status, detail }]);
  }

  async function handleSeed() {
    setSeeding(true);
    setResults([]);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addResult("Auth", "error", "Not authenticated. Please log in first.");
      setSeeding(false);
      return;
    }

    // ── Step 1: Setup user profile ──
    setPhase("Setting up profile...");
    await supabase.from("profiles").update({
      role: "both",
      full_name: user.user_metadata?.full_name || "Test User",
      bio: "Professional experience host and passionate learner on JustDoStuff.",
      city: "San Francisco",
      state: "CA",
      phone: "(555) 123-4567",
      emergency_contact_name: "Emergency Contact",
      emergency_contact_phone: "(555) 987-6543",
    }).eq("id", user.id);
    addResult("Profile", "success", "Updated profile with complete info (role: both)");

    // ── Step 2: Fetch categories ──
    const { data: categories } = await supabase.from("categories").select("id, slug");
    if (!categories) {
      addResult("Categories", "error", "Failed to fetch categories");
      setSeeding(false);
      return;
    }
    const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));
    addResult("Categories", "success", `Loaded ${categories.length} categories`);

    // ── Step 3: Create experiences ──
    setPhase("Creating experiences...");
    const experienceIds: string[] = [];

    for (const exp of TEST_EXPERIENCES) {
      const categoryId = categoryMap[exp.category_slug];
      if (!categoryId) {
        addResult("Experience", "error", `Category ${exp.category_slug} not found for "${exp.title}"`);
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
        addResult("Experience", "error", `${exp.title}: ${error.message}`);
      } else {
        experienceIds.push(data.id);

        // Create availability slots (next 14 days)
        const today = new Date();
        const slots = [];
        for (let i = 1; i <= 5; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i * 2 + Math.floor(Math.random() * 3));
          slots.push({
            experience_id: data.id,
            date: date.toISOString().split("T")[0],
            start_time: i % 2 === 0 ? "09:00" : "13:00",
            end_time: i % 2 === 0 ? "13:00" : "17:00",
            total_spots: exp.max_seekers,
          });
        }
        await supabase.from("availability").insert(slots);
        addResult("Experience", "success", `${exp.title} — ${slots.length} slots`);
      }
    }

    if (experienceIds.length === 0) {
      addResult("Experiences", "error", "No experiences created. Stopping.");
      setSeeding(false);
      return;
    }

    // ── Step 4: Create bookings in various states ──
    setPhase("Creating bookings...");
    const bookingStatuses: Array<{ status: string; label: string }> = [
      { status: "completed", label: "Completed" },
      { status: "confirmed", label: "Confirmed" },
      { status: "pending", label: "Pending" },
      { status: "declined", label: "Declined" },
      { status: "cancelled", label: "Cancelled" },
    ];

    const bookingIds: string[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < Math.min(bookingStatuses.length, experienceIds.length); i++) {
      const expId = experienceIds[i];
      const bStatus = bookingStatuses[i];

      // Get an availability slot for this experience
      const { data: slots } = await supabase
        .from("availability")
        .select("id")
        .eq("experience_id", expId)
        .limit(1);

      if (!slots || slots.length === 0) continue;

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          seeker_id: user.id,
          provider_id: user.id,
          experience_id: expId,
          availability_id: slots[0].id,
          status: bStatus.status as "pending" | "confirmed" | "completed" | "declined" | "cancelled",
          tos_accepted_at: now,
          waiver_accepted_at: now,
          nda_accepted_at: now,
          seeker_emergency_name: "Jane Doe",
          seeker_emergency_phone: "(555) 111-2222",
          ...(bStatus.status === "cancelled" ? { cancellation_reason: "Schedule conflict — had to reschedule" } : {}),
        })
        .select("id")
        .single();

      if (error) {
        addResult("Booking", "error", `${bStatus.label}: ${error.message}`);
      } else {
        bookingIds.push(booking.id);
        addResult("Booking", "success", `${bStatus.label} booking for experience #${i + 1}`);
      }
    }

    // ── Step 5: Create reviews for completed bookings ──
    setPhase("Creating reviews...");
    let reviewCount = 0;

    // Find the completed booking
    const completedBookingIdx = bookingStatuses.findIndex(b => b.status === "completed");
    if (completedBookingIdx >= 0 && bookingIds[completedBookingIdx]) {
      const reviewData = TEST_REVIEWS.slice(0, 3);
      for (const rev of reviewData) {
        const { error } = await supabase.from("reviews").insert({
          booking_id: bookingIds[completedBookingIdx],
          reviewer_id: user.id,
          reviewee_id: user.id,
          experience_id: experienceIds[completedBookingIdx],
          rating: rev.rating,
          comment: rev.comment,
        });
        if (!error) reviewCount++;
      }
    }

    // Also add reviews for other experiences to make ratings look real
    for (let i = 1; i < experienceIds.length && i < TEST_REVIEWS.length; i++) {
      if (i === completedBookingIdx) continue;
      // Need a completed booking for reviews - create one
      const { data: slots } = await supabase
        .from("availability")
        .select("id")
        .eq("experience_id", experienceIds[i])
        .limit(1);

      if (!slots || slots.length === 0) continue;

      const { data: tempBooking } = await supabase
        .from("bookings")
        .insert({
          seeker_id: user.id,
          provider_id: user.id,
          experience_id: experienceIds[i],
          availability_id: slots[0].id,
          status: "completed",
          tos_accepted_at: now,
          waiver_accepted_at: now,
          seeker_emergency_name: "Jane Doe",
          seeker_emergency_phone: "(555) 111-2222",
        })
        .select("id")
        .single();

      if (tempBooking) {
        const { error } = await supabase.from("reviews").insert({
          booking_id: tempBooking.id,
          reviewer_id: user.id,
          reviewee_id: user.id,
          experience_id: experienceIds[i],
          rating: TEST_REVIEWS[i].rating,
          comment: TEST_REVIEWS[i].comment,
        });
        if (!error) reviewCount++;
      }
    }

    addResult("Reviews", "success", `Created ${reviewCount} reviews with ratings & comments`);

    // ── Step 6: Create conversations & messages ──
    setPhase("Creating conversations & messages...");
    let msgCount = 0;

    for (let i = 0; i < Math.min(bookingIds.length, TEST_MESSAGES.length); i++) {
      // Create conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          booking_id: bookingIds[i],
          seeker_id: user.id,
          provider_id: user.id,
        })
        .select("id")
        .single();

      if (convErr || !conv) continue;

      // Insert message pairs
      const msgPair = TEST_MESSAGES[i];
      for (let j = 0; j < msgPair.length; j++) {
        const { error } = await supabase.from("messages").insert({
          conversation_id: conv.id,
          sender_id: user.id,
          content: msgPair[j],
          is_read: j === 0, // first message read, reply unread
        });
        if (!error) msgCount++;
      }
    }

    addResult("Messages", "success", `Created ${Math.min(bookingIds.length, TEST_MESSAGES.length)} conversations with ${msgCount} messages`);

    // ── Step 7: Create a verification request ──
    setPhase("Creating verification request...");
    const { error: verErr } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || "Test User",
      profession: "Software Engineer & Startup Founder",
      company: "JustDoStuff Inc.",
      linkedin_url: "https://linkedin.com/in/testuser",
      website_url: "https://justdostuff.com",
      years_experience: 8,
      bio: "Experienced professional with 8+ years in tech startups. Passionate about sharing knowledge and mentoring the next generation of entrepreneurs.",
      status: "pending",
    });

    if (verErr) {
      addResult("Verification", "info", `Verification request: ${verErr.message} (may already exist)`);
    } else {
      addResult("Verification", "success", "Created pending verification request");
    }

    setPhase("");
    setDone(true);
    setSeeding(false);
  }

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

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
            This will create comprehensive test data for your account including
            experiences, bookings, reviews, conversations, and a verification request.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Database className="h-4 w-4 text-primary" />
              <span>5 Experiences + Slots</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>5 Bookings (all states)</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>8 Reviews & Ratings</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <span>5 Conversations</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Users className="h-4 w-4 text-green-600" />
              <span>Profile Completed</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Check className="h-4 w-4 text-amber-600" />
              <span>Verification Request</span>
            </div>
          </div>

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
              ? phase || "Seeding..."
              : done
                ? `Done! (${successCount} success, ${errorCount} errors)`
                : "Seed All Test Data"}
          </Button>

          {results.length > 0 && (
            <div className="max-h-80 space-y-1.5 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                    r.status === "error"
                      ? "border-red-200 bg-red-50"
                      : r.status === "info"
                        ? "border-amber-200 bg-amber-50"
                        : "border-green-200 bg-green-50"
                  }`}
                >
                  {r.status === "error" ? (
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  ) : r.status === "info" ? (
                    <Database className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{r.step}:</span>{" "}
                    <span className="text-muted-foreground">{r.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {done && (
            <div className="grid grid-cols-2 gap-2">
              <a href="/explore">
                <Button variant="outline" className="w-full">
                  View Explore
                </Button>
              </a>
              <a href="/bookings">
                <Button variant="outline" className="w-full">
                  View Bookings
                </Button>
              </a>
              <a href="/messages">
                <Button variant="outline" className="w-full">
                  View Messages
                </Button>
              </a>
              <a href="/dashboard/analytics">
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
