export type UserRole = "seeker" | "provider" | "both";
export type ExperienceStatus = "draft" | "published" | "archived";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined";
export type SlotDuration = "2-4h" | "4-6h";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          phone: string | null;
          city: string | null;
          state: string | null;
          is_verified: boolean;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          stripe_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
          is_verified?: boolean;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
          is_verified?: boolean;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
      };
      charities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          website_url: string | null;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      experiences: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string;
          title: string;
          description: string;
          short_description: string | null;
          photos: string[];
          city: string;
          state: string;
          address: string | null;
          price: number;
          slot_duration: SlotDuration;
          max_seekers: number;
          requires_nda: boolean;
          status: ExperienceStatus;
          avg_rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_id: string;
          title: string;
          description: string;
          short_description?: string | null;
          photos?: string[];
          city: string;
          state: string;
          address?: string | null;
          price?: number;
          slot_duration?: SlotDuration;
          max_seekers?: number;
          requires_nda?: boolean;
          status?: ExperienceStatus;
          avg_rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          category_id?: string;
          title?: string;
          description?: string;
          short_description?: string | null;
          photos?: string[];
          city?: string;
          state?: string;
          address?: string | null;
          price?: number;
          slot_duration?: SlotDuration;
          max_seekers?: number;
          requires_nda?: boolean;
          status?: ExperienceStatus;
          avg_rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability: {
        Row: {
          id: string;
          experience_id: string;
          date: string;
          start_time: string;
          end_time: string;
          total_spots: number;
          booked_spots: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          experience_id: string;
          date: string;
          start_time: string;
          end_time: string;
          total_spots?: number;
          booked_spots?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          experience_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          total_spots?: number;
          booked_spots?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          seeker_id: string;
          provider_id: string;
          experience_id: string;
          availability_id: string;
          status: BookingStatus;
          tos_accepted_at: string | null;
          waiver_accepted_at: string | null;
          nda_accepted_at: string | null;
          seeker_emergency_name: string | null;
          seeker_emergency_phone: string | null;
          provider_emergency_name: string | null;
          provider_emergency_phone: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          provider_id: string;
          experience_id: string;
          availability_id: string;
          status?: BookingStatus;
          tos_accepted_at?: string | null;
          waiver_accepted_at?: string | null;
          nda_accepted_at?: string | null;
          seeker_emergency_name?: string | null;
          seeker_emergency_phone?: string | null;
          provider_emergency_name?: string | null;
          provider_emergency_phone?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seeker_id?: string;
          provider_id?: string;
          experience_id?: string;
          availability_id?: string;
          status?: BookingStatus;
          tos_accepted_at?: string | null;
          waiver_accepted_at?: string | null;
          nda_accepted_at?: string | null;
          seeker_emergency_name?: string | null;
          seeker_emergency_phone?: string | null;
          provider_emergency_name?: string | null;
          provider_emergency_phone?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          experience_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          experience_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          experience_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      experience_status: ExperienceStatus;
      booking_status: BookingStatus;
      slot_duration: SlotDuration;
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Charity = Database["public"]["Tables"]["charities"]["Row"];
export type Experience = Database["public"]["Tables"]["experiences"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Availability = Database["public"]["Tables"]["availability"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
