-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  profession TEXT NOT NULL,
  company TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  years_experience INTEGER NOT NULL DEFAULT 1,
  bio TEXT NOT NULL,
  government_id_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint - one pending request per user
CREATE UNIQUE INDEX verification_requests_user_pending
  ON verification_requests(user_id)
  WHERE status = 'pending';

-- RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  USING (user_id = auth.uid());

-- Users can create verification requests
CREATE POLICY "Users can submit verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON verification_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');
