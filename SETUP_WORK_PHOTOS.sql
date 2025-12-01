-- 1. Create a storage bucket for work photos
insert into storage.buckets (id, name, public)
values ('work-photos', 'work-photos', true)
on conflict (id) do nothing;

-- 2. Enable RLS on the bucket (optional but recommended)
-- For simplicity, we allow public read, and authenticated upload
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'work-photos' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'work-photos' AND auth.role() = 'authenticated' );

-- 3. Add 'photos' column to work_progress table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_progress' AND column_name = 'photos') THEN
        ALTER TABLE work_progress ADD COLUMN photos TEXT[];
    END IF;
END $$;
