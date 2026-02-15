"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  experienceSchema,
  type ExperienceFormData,
} from "@/lib/validations/experience";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Upload,
  X,
  ImagePlus,
  Save,
  Send,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types/database";
import Link from "next/link";

export default function NewExperiencePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      description: "",
      short_description: "",
      category_id: "",
      city: "",
      state: "",
      address: "",
      price: 0,
      slot_duration: "2-4h",
      max_seekers: 1,
      requires_nda: false,
    },
  });

  const requiresNda = watch("requires_nda");
  const slotDuration = watch("slot_duration");

  const init = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user is a provider
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile && profile.role === "seeker") {
      toast.error("You need to be a provider to create experiences");
      router.push("/dashboard");
      return;
    }

    setUserId(user.id);

    // Fetch categories
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (cats) setCategories(cats);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    init();
  }, [init]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !userId) return;

    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("experience-photos")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("experience-photos").getPublicUrl(fileName);

      setPhotos((prev) => [...prev, publicUrl]);
    }

    setUploading(false);
    // Reset file input
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: ExperienceFormData, status: "draft" | "published") {
    if (!userId) return;

    setSaving(true);

    const { error } = await supabase.from("experiences").insert({
      provider_id: userId,
      title: data.title,
      description: data.description,
      short_description: data.short_description || null,
      category_id: data.category_id,
      city: data.city,
      state: data.state,
      address: data.address || null,
      price: data.price,
      slot_duration: data.slot_duration,
      max_seekers: data.max_seekers,
      requires_nda: data.requires_nda,
      photos,
      status,
    });

    if (error) {
      toast.error("Failed to save experience");
      console.error(error);
    } else {
      toast.success(
        status === "published"
          ? "Experience published!"
          : "Draft saved successfully"
      );
      router.push("/dashboard");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Create Experience</h1>
        <p className="mt-1 text-muted-foreground">
          List your professional experience for seekers to discover and book.
        </p>
      </div>

      <form className="space-y-6">
        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              Add up to 5 photos to showcase your experience. The first photo
              will be used as the cover image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {photos.length < 5 && (
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <ImagePlus className="mb-1 h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Add photo
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Shadow a Tech Startup Founder for a Day"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                placeholder="A brief summary shown in listings"
                {...register("short_description")}
              />
              {errors.short_description && (
                <p className="text-sm text-destructive">
                  {errors.short_description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what seekers will experience, what they'll learn, what to expect..."
                rows={6}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                onValueChange={(val) => setValue("category_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="CA"
                  {...register("state")}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Full address (shared after booking is confirmed)"
                {...register("address")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Set to 0 for free experiences
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_seekers">Max Seekers per Slot</Label>
                <Input
                  id="max_seekers"
                  type="number"
                  min="1"
                  max="20"
                  {...register("max_seekers")}
                />
                {errors.max_seekers && (
                  <p className="text-sm text-destructive">
                    {errors.max_seekers.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Duration</Label>
              <Select
                value={slotDuration}
                onValueChange={(val: "2-4h" | "4-6h") =>
                  setValue("slot_duration", val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-4h">2 - 4 hours</SelectItem>
                  <SelectItem value="4-6h">4 - 6 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requires_nda">Require NDA</Label>
                <p className="text-sm text-muted-foreground">
                  Seekers must accept an NDA before booking
                </p>
              </div>
              <Switch
                id="requires_nda"
                checked={requiresNda}
                onCheckedChange={(checked) =>
                  setValue("requires_nda", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={handleSubmit((data) => onSubmit(data, "published"))}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Publish Experience
          </Button>
        </div>
      </form>
    </div>
  );
}
