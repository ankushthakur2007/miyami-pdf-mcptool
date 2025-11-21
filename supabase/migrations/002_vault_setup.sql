-- Enable Vault extension for encrypted secrets
create extension if not exists vault with schema vault cascade;

-- Function to insert JWT signing secret into Vault
-- Only accessible via service_role
create or replace function public.insert_jwt_secret(
  secret_name text,
  secret_value text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  secret_id uuid;
begin
  -- Only service_role can access Vault
  if current_setting('role') != 'service_role' then
    raise exception 'Authentication required - service_role only';
  end if;
  
  -- Validate inputs
  if secret_name is null or secret_name = '' then
    raise exception 'Secret name cannot be empty';
  end if;
  
  if secret_value is null or secret_value = '' then
    raise exception 'Secret value cannot be empty';
  end if;
  
  -- Create secret in Vault
  secret_id := vault.create_secret(secret_value, secret_name);
  
  return secret_id;
end;
$$;

-- Function to read JWT signing secret from Vault
-- Only accessible via service_role
create or replace function public.read_jwt_secret(
  secret_name text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  secret text;
begin
  if current_setting('role') != 'service_role' then
    raise exception 'Authentication required - service_role only';
  end if;
  
  if secret_name is null or secret_name = '' then
    raise exception 'Secret name cannot be empty';
  end if;
  
  select decrypted_secret 
  from vault.decrypted_secrets 
  where name = secret_name 
  into secret;
  
  if secret is null then
    raise exception 'Secret not found: %', secret_name;
  end if;
  
  return secret;
end;
$$;

-- Function to delete JWT secret from Vault
create or replace function public.delete_jwt_secret(
  secret_name text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('role') != 'service_role' then
    raise exception 'Authentication required - service_role only';
  end if;
  
  delete from vault.secrets where name = secret_name;
  
  return true;
end;
$$;

-- Grant execute permissions to service_role only
grant execute on function public.insert_jwt_secret to service_role;
grant execute on function public.read_jwt_secret to service_role;
grant execute on function public.delete_jwt_secret to service_role;
