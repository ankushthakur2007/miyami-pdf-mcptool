-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- API Keys table (stores SHA-256 hashed keys)
create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_hash text unique not null,
  key_prefix text not null,
  name text not null default 'Default Key',
  vault_secret_id uuid,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone,
  is_active boolean default true,
  rate_limit_per_hour integer default 100,
  total_requests integer default 0,
  metadata jsonb default '{}'::jsonb
);

-- PDFs table (stores metadata for generated PDFs)
create table public.pdfs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  api_key_id uuid references public.api_keys(id) on delete set null,
  filename text not null,
  storage_path text not null unique,
  public_url text not null,
  file_size integer,
  page_count integer,
  format text default 'A4',
  source_type text check (source_type in ('html', 'markdown', 'url', 'template', 'text')),
  operation_type text check (operation_type in ('generate', 'merge', 'modify', 'watermark', 'compress')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  created_via text check (created_via in ('api', 'dashboard', 'mcp')) default 'api'
);

-- Usage tracking table
create table public.api_usage (
  id uuid primary key default uuid_generate_v4(),
  api_key_id uuid references public.api_keys(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  pdf_id uuid references public.pdfs(id) on delete set null,
  method text not null,
  created_at timestamp with time zone default now(),
  response_time_ms integer,
  status_code integer,
  error_message text,
  request_size integer,
  response_size integer
);

-- Templates table (for future template support)
create table public.pdf_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  template_html text not null,
  variables jsonb default '[]'::jsonb,
  is_public boolean default false,
  usage_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_api_keys_user_id on public.api_keys(user_id);
create index idx_api_keys_hash on public.api_keys(key_hash);
create index idx_api_keys_active on public.api_keys(is_active) where is_active = true;

create index idx_pdfs_user_id on public.pdfs(user_id);
create index idx_pdfs_api_key_id on public.pdfs(api_key_id);
create index idx_pdfs_created_at on public.pdfs(created_at desc);
create index idx_pdfs_source_type on public.pdfs(source_type);

create index idx_api_usage_api_key_id on public.api_usage(api_key_id);
create index idx_api_usage_user_id on public.api_usage(user_id);
create index idx_api_usage_created_at on public.api_usage(created_at desc);
create index idx_api_usage_endpoint on public.api_usage(endpoint);

create index idx_templates_user_id on public.pdf_templates(user_id);
create index idx_templates_public on public.pdf_templates(is_public) where is_public = true;

-- Create updated_at trigger for templates
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_pdf_templates_updated_at
  before update on public.pdf_templates
  for each row
  execute function update_updated_at_column();
