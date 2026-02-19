# Supabase Configuration for MY SNS

## Required Environment Variables

Add these to your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

1. Create a project at https://supabase.com
2. Enable Authentication
3. Enable Storage
4. Create storage buckets:
   - profile-images
   - background-images
   - text-images
   - logo-images
   - cardnews-images

## Storage Policies

Set public read access for all buckets:

```sql
-- Enable public read for all buckets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('profile-images', 'background-images', 'text-images', 'logo-images', 'cardnews-images') );
```
