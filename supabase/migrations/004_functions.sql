-- Function to get user usage statistics
create or replace function public.get_usage_stats(
  p_user_id uuid,
  p_days integer default 30
)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  -- Verify user is requesting their own stats
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;
  
  select json_build_object(
    'total_pdfs', (
      select count(*) 
      from public.pdfs 
      where user_id = p_user_id 
      and created_at > now() - interval '1 day' * p_days
    ),
    'total_requests', (
      select count(*) 
      from public.api_usage 
      where user_id = p_user_id 
      and created_at > now() - interval '1 day' * p_days
    ),
    'total_storage_bytes', (
      select coalesce(sum(file_size), 0) 
      from public.pdfs 
      where user_id = p_user_id
    ),
    'requests_by_endpoint', (
      select json_object_agg(endpoint, count)
      from (
        select endpoint, count(*) as count
        from public.api_usage
        where user_id = p_user_id
        and created_at > now() - interval '1 day' * p_days
        group by endpoint
      ) sub
    ),
    'pdfs_by_type', (
      select json_object_agg(source_type, count)
      from (
        select source_type, count(*) as count
        from public.pdfs
        where user_id = p_user_id
        and created_at > now() - interval '1 day' * p_days
        group by source_type
      ) sub
    )
  ) into result;
  
  return result;
end;
$$;

grant execute on function public.get_usage_stats to authenticated;

-- Function to check rate limit
create or replace function public.check_rate_limit(
  p_api_key_hash text
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_api_key_id uuid;
  v_rate_limit integer;
  v_request_count integer;
begin
  -- Get API key details
  select id, rate_limit_per_hour
  into v_api_key_id, v_rate_limit
  from public.api_keys
  where key_hash = p_api_key_hash
  and is_active = true;
  
  if v_api_key_id is null then
    return false;
  end if;
  
  -- Count requests in the last hour
  select count(*)
  into v_request_count
  from public.api_usage
  where api_key_id = v_api_key_id
  and created_at > now() - interval '1 hour';
  
  return v_request_count < v_rate_limit;
end;
$$;

grant execute on function public.check_rate_limit to service_role;
