import { z } from "zod";

export const experienceSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be under 2000 characters"),
  short_description: z
    .string()
    .max(200, "Short description must be under 200 characters")
    .optional()
    .or(z.literal("")),
  category_id: z.string().uuid("Please select a category"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  address: z.string().optional().or(z.literal("")),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .max(10000, "Price cannot exceed $10,000"),
  slot_duration: z.enum(["2-4h", "4-6h"]),
  max_seekers: z.coerce
    .number()
    .int()
    .min(1, "Must allow at least 1 seeker")
    .max(20, "Maximum 20 seekers per slot"),
  requires_nda: z.boolean(),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;
