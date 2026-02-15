-- ============================================
-- JustDoStuff - Initial Database Schema
-- ============================================

-- Enums
CREATE TYPE user_role AS ENUM ('seeker', 'provider', 'both');
CREATE TYPE experience_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined');
CREATE TYPE slot_duration AS ENUM ('2-4h', '4-6h');

-- ============================================
-- Profiles (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'seeker',
  phone TEXT,
  city TEXT,
  state TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Categories
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Charities
-- ============================================
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Experiences
-- ============================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  photos TEXT[] DEFAULT '{}',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  slot_duration slot_duration DEFAULT '2-4h',
  max_seekers INTEGER DEFAULT 1,
  requires_nda BOOLEAN DEFAULT FALSE,
  status experience_status DEFAULT 'draft',
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Full-text search index
CREATE INDEX experiences_search_idx ON experiences
  USING gin(to_tsvector('english', title || ' ' || description || ' ' || city));

CREATE INDEX experiences_status_idx ON experiences(status);
CREATE INDEX experiences_provider_idx ON experiences(provider_id);
CREATE INDEX experiences_category_idx ON experiences(category_id);

-- ============================================
-- Availability
-- ============================================
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_spots INTEGER DEFAULT 1,
  booked_spots INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time CHECK (end_time > start_time),
  CONSTRAINT valid_spots CHECK (booked_spots <= total_spots)
);

CREATE INDEX availability_experience_idx ON availability(experience_id);
CREATE INDEX availability_date_idx ON availability(date);

-- ============================================
-- Bookings
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  experience_id UUID NOT NULL REFERENCES experiences(id),
  availability_id UUID NOT NULL REFERENCES availability(id),
  status booking_status DEFAULT 'pending',
  tos_accepted_at TIMESTAMPTZ,
  waiver_accepted_at TIMESTAMPTZ,
  nda_accepted_at TIMESTAMPTZ,
  seeker_emergency_name TEXT,
  seeker_emergency_phone TEXT,
  provider_emergency_name TEXT,
  provider_emergency_phone TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX bookings_seeker_idx ON bookings(seeker_id);
CREATE INDEX bookings_provider_idx ON bookings(provider_id);
CREATE INDEX bookings_experience_idx ON bookings(experience_id);

-- ============================================
-- Reviews
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  experience_id UUID NOT NULL REFERENCES experiences(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX reviews_unique_idx ON reviews(booking_id, reviewer_id);

-- Update experience avg_rating on review insert
CREATE OR REPLACE FUNCTION public.update_experience_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE experiences SET
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE experience_id = NEW.experience_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE experience_id = NEW.experience_id)
  WHERE id = NEW.experience_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

-- ============================================
-- Conversations & Messages
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  seeker_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id);

-- ============================================
-- Reports
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_id UUID NOT NULL REFERENCES profiles(id),
  experience_id UUID REFERENCES experiences(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- Charities: public read
CREATE POLICY "Charities are viewable by everyone"
  ON charities FOR SELECT USING (true);

-- Experiences: public read for published, own CRUD for providers
CREATE POLICY "Published experiences are viewable by everyone"
  ON experiences FOR SELECT USING (status = 'published' OR provider_id = auth.uid());

CREATE POLICY "Providers can create experiences"
  ON experiences FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update own experiences"
  ON experiences FOR UPDATE USING (provider_id = auth.uid());

CREATE POLICY "Providers can delete own experiences"
  ON experiences FOR DELETE USING (provider_id = auth.uid());

-- Availability: public read, provider write
CREATE POLICY "Availability is viewable by everyone"
  ON availability FOR SELECT USING (true);

CREATE POLICY "Providers can manage availability"
  ON availability FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM experiences WHERE id = experience_id AND provider_id = auth.uid())
  );

CREATE POLICY "Providers can update availability"
  ON availability FOR UPDATE USING (
    EXISTS (SELECT 1 FROM experiences WHERE id = experience_id AND provider_id = auth.uid())
  );

-- Bookings: own bookings only
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT USING (seeker_id = auth.uid() OR provider_id = auth.uid());

CREATE POLICY "Seekers can create bookings"
  ON bookings FOR INSERT WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Participants can update bookings"
  ON bookings FOR UPDATE USING (seeker_id = auth.uid() OR provider_id = auth.uid());

-- Reviews: public read, booking participants write
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Booking participants can create reviews"
  ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Conversations & Messages: participants only
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (seeker_id = auth.uid() OR provider_id = auth.uid());

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id
      AND (seeker_id = auth.uid() OR provider_id = auth.uid()))
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id
      AND (seeker_id = auth.uid() OR provider_id = auth.uid()))
  );

-- Reports: own reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (reporter_id = auth.uid());

-- ============================================
-- Seed Data: Categories
-- ============================================
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Technology & Startups', 'technology-startups', 'Shadow tech founders, engineers, and startup teams', 'Monitor'),
  ('Culinary & Restaurants', 'culinary-restaurants', 'Experience professional kitchens and restaurant operations', 'ChefHat'),
  ('Photography & Film', 'photography-film', 'Join photographers and filmmakers on shoots', 'Camera'),
  ('Real Estate', 'real-estate', 'Shadow agents, property managers, and developers', 'Building'),
  ('Veterinary & Animal Care', 'veterinary-animal-care', 'Experience animal hospitals and wildlife care', 'Heart'),
  ('Architecture & Design', 'architecture-design', 'Shadow architects and interior designers', 'Ruler'),
  ('Brewing & Distilling', 'brewing-distilling', 'Learn the craft of brewing and distilling', 'Beer'),
  ('Music Production', 'music-production', 'Experience recording studios and live sound', 'Music'),
  ('Fitness & Wellness', 'fitness-wellness', 'Shadow trainers, therapists, and wellness practitioners', 'Dumbbell'),
  ('Woodworking & Crafts', 'woodworking-crafts', 'Learn traditional and modern crafting techniques', 'Hammer'),
  ('Healthcare & Medicine', 'healthcare-medicine', 'Shadow healthcare professionals in clinical settings', 'Stethoscope'),
  ('Legal & Law', 'legal-law', 'Experience law firms, courtrooms, and legal practice', 'Scale'),
  ('Aviation & Aerospace', 'aviation-aerospace', 'Shadow pilots, engineers, and air traffic controllers', 'Plane'),
  ('Agriculture & Farming', 'agriculture-farming', 'Experience modern farming and agricultural operations', 'Sprout'),
  ('Fashion & Textiles', 'fashion-textiles', 'Shadow designers, stylists, and fashion houses', 'Shirt');

-- ============================================
-- Seed Data: Charities
-- ============================================
INSERT INTO charities (name, description, website_url) VALUES
  ('Feeding America', 'The largest hunger-relief organization in the United States', 'https://www.feedingamerica.org'),
  ('Direct Relief', 'Humanitarian aid to people affected by poverty and emergencies', 'https://www.directrelief.org'),
  ('St. Jude Children''s Research Hospital', 'Leading children''s hospital for cancer and other diseases', 'https://www.stjude.org'),
  ('Habitat for Humanity', 'Building homes, communities, and hope', 'https://www.habitat.org'),
  ('Save the Children', 'Giving children a healthy start, education, and protection', 'https://www.savethechildren.org'),
  ('American Red Cross', 'Disaster relief, blood donations, and emergency assistance', 'https://www.redcross.org'),
  ('United Way', 'Fighting for health, education, and financial stability of every person', 'https://www.unitedway.org'),
  ('The Nature Conservancy', 'Protecting the lands and waters on which all life depends', 'https://www.nature.org'),
  ('Doctors Without Borders', 'Medical humanitarian assistance worldwide', 'https://www.doctorswithoutborders.org'),
  ('Teach For America', 'Working to ensure educational equity and excellence', 'https://www.teachforamerica.org');
