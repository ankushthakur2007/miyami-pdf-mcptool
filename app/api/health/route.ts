import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('api_keys').select('count').limit(1);
    
    if (dbError) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          database: 'error',
          error: dbError.message 
        },
        { status: 503 }
      );
    }

    // Check Puppeteer availability
    let puppeteerStatus = 'not_checked';
    try {
      // Only check if puppeteer is available, don't actually launch
      const puppeteer = await import('puppeteer');
      puppeteerStatus = puppeteer ? 'available' : 'unavailable';
    } catch (error) {
      puppeteerStatus = 'error';
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      puppeteer: puppeteerStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
