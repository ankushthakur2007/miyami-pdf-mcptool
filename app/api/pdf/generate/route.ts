import { NextRequest, NextResponse } from 'next/server'
import { generatePdfAuto } from '@/lib/pdf/generator'
import { GeneratePdfSchema } from '@/lib/utils/validation'
import { validateApiKey, updateApiKeyUsage } from '@/lib/api/api-key-validator'
import { checkRateLimit, logApiUsage } from '@/lib/api/rate-limiter'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      )
    }

    const { apiKeyId, userId } = validation

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(apiKeyId!)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: rateLimitCheck },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await req.json()
    const bodyValidation = GeneratePdfSchema.safeParse(body)

    if (!bodyValidation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyValidation.error.errors },
        { status: 400 }
      )
    }

    const { html, markdown, text, options } = bodyValidation.data

    // Determine content type and generate PDF
    let content: string
    let type: 'html' | 'markdown' | 'text'

    if (html) {
      content = html
      type = 'html'
    } else if (markdown) {
      content = markdown
      type = 'markdown'
    } else {
      content = text!
      type = 'text'
    }

    // Generate PDF
    const pdfResult = await generatePdfAuto(content, type, options)

    // Upload to Supabase Storage
    const filename = pdfResult.filename
    const filePath = `${userId}/${filename}`

    const supabase = createServiceClient()
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, pdfResult.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload PDF' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath)

    // Save metadata to database
    const { data: pdfRecord, error: dbError } = await supabase
      .from('pdfs')
      .insert({
        user_id: userId!,
        api_key_id: apiKeyId!,
        filename,
        storage_path: filePath,
        file_size: pdfResult.buffer.length,
        format: options?.format || 'A4',
        source_type: type,
        public_url: publicUrl,
      } as any)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save PDF metadata' },
        { status: 500 }
      )
    }

    // Log usage
    await logApiUsage({
      apiKeyId: apiKeyId!,
      userId: userId!,
      endpoint: '/api/pdf/generate',
      method: 'POST',
      pdfId: (pdfRecord as any).id,
      responseTimeMs: 0,
      statusCode: 200,
      responseSize: pdfResult.buffer.length,
    })
    await updateApiKeyUsage(apiKeyId!)

    return NextResponse.json({
      message: 'PDF generated successfully',
      pdf: {
        id: (pdfRecord as any).id,
        filename,
        url: publicUrl,
        size: pdfResult.buffer.length,
        format: options?.format || 'A4',
        created_at: (pdfRecord as any).created_at,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
