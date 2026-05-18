-- ============================================================
-- Allow guests to leave reviews on the website itself.
-- Adds 'website' as a valid review source + an RLS insert policy
-- so anonymous submissions go through.
-- ============================================================

-- The original check constraint didn't include 'website'. Replace it.
alter table public.reviews
  drop constraint if exists reviews_source_check;

alter table public.reviews
  add constraint reviews_source_check
  check (source in ('google','foodpanda','instagram','facebook','tripadvisor','manual','website'));

-- Public can submit a review (anon key). Reads on the public site
-- only return is_featured = true, so a brand-new website review needs
-- the admin to feature it before it appears.
drop policy if exists "reviews_public_insert" on public.reviews;
create policy "reviews_public_insert" on public.reviews
  for insert with check (source = 'website');
