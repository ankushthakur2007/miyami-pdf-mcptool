import { createServiceClient } from '@/lib/supabase/server'
import { generateApiKey, hashApiKey, extractKeyPrefix } from '@/lib/utils/crypto'
import { CreateApiKeySchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = CreateApiKeySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, rate_limit_per_hour } = validation.data

    // Generate API key
    const apiKey = generateApiKey()
    const hashedKey = hashApiKey(apiKey)
    const keyPrefix = extractKeyPrefix(apiKey)

    // Store in database using service client
    const serviceSupabase = createServiceClient()
    const { data, error } = await serviceSupabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hashedKey,
        key_prefix: keyPrefix,
        rate_limit_per_hour,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'API key created successfully',
      api_key: apiKey, // Only returned once
      key_id: (data as any).id,
      name: (data as any).name,
      rate_limit_per_hour: (data as any).rate_limit_per_hour,
      created_at: (data as any).created_at,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, rate_limit_per_hour, is_active, created_at, last_used_at, total_requests')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false})

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({ api_keys: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
