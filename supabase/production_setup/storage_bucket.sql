-- ============================================================
-- SUPABASE STORAGE BUCKET & RLS POLICIES FOR PRODUCT IMAGES
-- ============================================================

-- 1. Create the public storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if any (prevents duplicate policy errors)
DROP POLICY IF EXISTS "Allow public uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from product-images" ON storage.objects;

-- 3. Create Policy: Allow anyone to upload images
CREATE POLICY "Allow public uploads to product-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- 4. Create Policy: Allow public read access to view product images
CREATE POLICY "Allow public reads from product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 5. Create Policy: Allow updating uploaded images
CREATE POLICY "Allow public updates to product-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product-images');

-- 6. Create Policy: Allow deleting images
CREATE POLICY "Allow public deletes from product-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');
