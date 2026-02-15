-- Create storage bucket for experience photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('experience-photos', 'experience-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload experience photos
CREATE POLICY "Authenticated users can upload experience photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'experience-photos');

-- Allow public read access to experience photos
CREATE POLICY "Anyone can view experience photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'experience-photos');

-- Allow users to update their own experience photos
CREATE POLICY "Users can update own experience photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'experience-photos');

-- Allow users to delete their own experience photos
CREATE POLICY "Users can delete own experience photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'experience-photos');
