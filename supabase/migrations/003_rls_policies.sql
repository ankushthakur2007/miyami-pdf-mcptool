-- Enable Row Level Security on all tables
alter table public.api_keys enable row level security;
alter table public.pdfs enable row level security;
alter table public.api_usage enable row level security;
alter table public.pdf_templates enable row level security;

-- API Keys policies
create policy "Users can view own API keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can create own API keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own API keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);

create policy "Users can update own API keys"
  on public.api_keys for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- PDFs policies
create policy "Users can view own PDFs"
  on public.pdfs for select
  using (auth.uid() = user_id);

create policy "Users can create PDFs"
  on public.pdfs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own PDFs"
  on public.pdfs for delete
  using (auth.uid() = user_id);

-- API Usage policies
create policy "Users can view own usage"
  on public.api_usage for select
  using (auth.uid() = user_id);

create policy "Service role can insert usage"
  on public.api_usage for insert
  with check (true);

-- Templates policies
create policy "Users can view own templates"
  on public.pdf_templates for select
  using (auth.uid() = user_id);

create policy "Users can view public templates"
  on public.pdf_templates for select
  using (is_public = true);

create policy "Users can create own templates"
  on public.pdf_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.pdf_templates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.pdf_templates for delete
  using (auth.uid() = user_id);

-- Storage policies for PDFs bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pdfs', 
  'pdfs', 
  true,
  52428800, -- 50MB limit
  array['application/pdf']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload PDFs to their own folder
create policy "Allow authenticated uploads to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pdfs' 
    and (storage.foldername(name))[1] = (auth.uid()::text)
  );

-- Allow users to read their own PDFs
create policy "Allow users to read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'pdfs' 
    and (storage.foldername(name))[1] = (auth.uid()::text)
  );

-- Allow public read access (for public download URLs)
create policy "Allow public downloads"
  on storage.objects for select
  to public
  using (bucket_id = 'pdfs');

-- Allow users to delete their own PDFs
create policy "Allow users to delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pdfs' 
    and (storage.foldername(name))[1] = (auth.uid()::text)
  );
