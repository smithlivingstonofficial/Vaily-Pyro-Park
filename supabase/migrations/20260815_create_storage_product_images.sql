-- -------------------------------------------------------------
-- Create Supabase Storage Bucket for Product Images
-- -------------------------------------------------------------

-- 1. Insert product-images bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 10485760;

-- 2. Public read access policy for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Access on Product Images Bucket'
  ) THEN
    CREATE POLICY "Public Read Access on Product Images Bucket" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-images');
  END IF;
END $$;

-- 3. Allow insert/upload access for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Insert on Product Images Bucket'
  ) THEN
    CREATE POLICY "Allow Insert on Product Images Bucket" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- 4. Allow update & delete access for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Update on Product Images Bucket'
  ) THEN
    CREATE POLICY "Allow Update on Product Images Bucket" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Delete on Product Images Bucket'
  ) THEN
    CREATE POLICY "Allow Delete on Product Images Bucket" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'product-images');
  END IF;
END $$;
