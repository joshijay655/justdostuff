"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Briefcase,
  Globe,
  Linkedin,
  Building,
} from "lucide-react";
import { toast } from "sonner";

type VerificationStatus = "none" | "pending" | "approved" | "rejected";

interface VerificationData {
  id: string;
  status: "pending" | "approved" | "rejected";
  full_name: string;
  profession: string;
  company: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  years_experience: number;
  bio: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>("none");
  const [existingRequest, setExistingRequest] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [yearsExperience, setYearsExperience] = useState(1);
  const [bio, setBio] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if already verified
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_verified, full_name, bio")
      .eq("id", user.id)
      .single();

    if (profile?.is_verified) {
      setIsVerified(true);
      setStatus("approved");
      setLoading(false);
      return;
    }

    // Pre-fill from profile
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }

    // Check for existing verification request
    const { data: requests } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (requests && requests.length > 0) {
      const req = requests[0];
      setExistingRequest(req as VerificationData);
      setStatus(req.status as VerificationStatus);

      // Pre-fill form with existing data for rejected requests
      if (req.status === "rejected") {
        setFullName(req.full_name);
        setProfession(req.profession);
        setCompany(req.company || "");
        setLinkedinUrl(req.linkedin_url || "");
        setWebsiteUrl(req.website_url || "");
        setYearsExperience(req.years_experience);
        setBio(req.bio);
      }
    }

    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !profession || !bio) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in");
      return;
    }

    const { error } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      full_name: fullName,
      profession,
      company: company || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
      years_experience: yearsExperience,
      bio,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("You already have a pending verification request");
      } else {
        toast.error("Failed to submit request");
        console.error(error);
      }
    } else {
      toast.success("Verification request submitted!");
      // Send email notification
      fetch("/api/notify/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: fullName }),
      }).catch(() => {});
      setStatus("pending");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Provider Verification</h1>
        <p className="mt-2 text-muted-foreground">
          Get verified to build trust with seekers and stand out on the platform
        </p>
      </div>

      {/* Already Verified */}
      {isVerified && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-center gap-4 p-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                You&apos;re Verified!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your profile shows a verified badge. Seekers can see you&apos;re a trusted provider.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Request */}
      {status === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-10 w-10 text-yellow-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Verification Under Review
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your verification request is being reviewed. This typically takes 24-48 hours.
                We&apos;ll notify you once a decision is made.
              </p>
              {existingRequest && (
                <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  Submitted {new Date(existingRequest.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected - allow resubmission */}
      {status === "rejected" && existingRequest && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-4 p-6">
            <XCircle className="h-10 w-10 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Verification Not Approved
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your previous request was not approved.
                {existingRequest.admin_notes && (
                  <span> Feedback: &ldquo;{existingRequest.admin_notes}&rdquo;</span>
                )}
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                You can update your information and submit a new request below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form — show for "none" or "rejected" */}
      {(status === "none" || status === "rejected") && (
        <>
          {/* Benefits */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Shield className="mb-2 h-8 w-8 text-primary" />
                <h4 className="text-sm font-semibold">Verified Badge</h4>
                <p className="text-xs text-muted-foreground">
                  Show seekers you&apos;re legit
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-primary" />
                <h4 className="text-sm font-semibold">More Bookings</h4>
                <p className="text-xs text-muted-foreground">
                  Verified providers get 3x more bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Briefcase className="mb-2 h-8 w-8 text-primary" />
                <h4 className="text-sm font-semibold">Priority Listing</h4>
                <p className="text-xs text-muted-foreground">
                  Appear higher in search results
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Application</CardTitle>
              <CardDescription>
                Tell us about your professional background. All information is kept confidential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Legal Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profession">
                      <Briefcase className="mr-1 inline h-3.5 w-3.5" />
                      Profession / Title *
                    </Label>
                    <Input
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Software Engineer, Chef, Veterinarian..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      <Building className="mr-1 inline h-3.5 w-3.5" />
                      Company / Organization
                    </Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min={1}
                    max={50}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">
                      <Linkedin className="mr-1 inline h-3.5 w-3.5" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">
                      <Globe className="mr-1 inline h-3.5 w-3.5" />
                      Website / Portfolio
                    </Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Professional Background *
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your professional experience, qualifications, and why you want to share your expertise on JustDoStuff..."
                    rows={5}
                    required
                    minLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters. The more detail you provide, the faster the review.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? "Submitting..." : "Submit Verification Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
