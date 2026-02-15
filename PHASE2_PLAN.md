# Phase 2: Core Marketplace Features

## Build Order (dependency-based)
1. Experience Creation Form (provider) — needed before anything else works
2. Experience Detail Page (public) — needed for seekers to see and book
3. Availability Management (provider) — needed before booking
4. Booking Flow (seeker) — the core transaction
5. Enhanced Dashboard (provider) — manage bookings
6. Review System — post-booking

## Implementation Details

### Step 1: Create Experience Form
- `src/app/dashboard/experiences/new/page.tsx` — client component with Zod validation
- `src/lib/validations/experience.ts` — Zod schema
- Supabase storage bucket: "experience-photos" (created via migration)
- Multi-photo upload (reuse avatar pattern)
- Save as draft or publish

### Step 2: Experience Detail Page
- `src/app/experiences/[id]/page.tsx` — server component
- Provider info card, photo gallery, reviews, booking CTA
- Link from explore page cards

### Step 3: Availability Management
- `src/app/dashboard/experiences/[id]/page.tsx` — manage single experience
- `src/components/availability-form.tsx` — add time slots

### Step 4: Booking Flow
- Booking dialog/page from experience detail
- Slot selection, TOS/waiver acceptance, emergency contact
- Creates booking with pending status

### Step 5: Enhanced Dashboard
- `src/app/dashboard/experiences/page.tsx` — list provider's experiences
- Booking management (confirm/decline)

### Step 6: Reviews
- Review form on completed bookings
- Star rating component
- Display on experience detail page
