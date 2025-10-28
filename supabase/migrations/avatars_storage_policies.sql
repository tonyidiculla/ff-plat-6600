-- ========================================
-- STORAGE POLICIES FOR avatars BUCKET
-- ========================================
-- This migration sets up storage policies for the avatars bucket
-- to allow authenticated users to upload and manage pet avatars.
-- ========================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- ========================================
-- POLICY 1: Upload Access
-- ========================================
-- Allow authenticated users to upload files to the avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
);

-- ========================================
-- POLICY 2: Public Read Access
-- ========================================
-- Allow anyone to view/download avatars (public bucket)
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'avatars'
);

-- ========================================
-- POLICY 3: Update Access
-- ========================================
-- Allow authenticated users to update files in the avatars bucket
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
)
WITH CHECK (
    bucket_id = 'avatars'
);

-- ========================================
-- POLICY 4: Delete Access
-- ========================================
-- Allow authenticated users to delete files in the avatars bucket
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify policies are active:

-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects'
-- AND policyname LIKE '%avatar%'
-- ORDER BY policyname;
