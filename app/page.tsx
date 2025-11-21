import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-blue-600">PDF SaaS</div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered PDF Generation API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Convert HTML, Markdown, and URLs to beautiful PDFs in seconds.
            Powerful API with rate limiting, authentication, and cloud storage.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Fast & Reliable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate PDFs in milliseconds with our optimized Puppeteer engine.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Secure & Scalable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Enterprise-grade security with API key authentication and rate limiting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">☁️</span>
                Cloud Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatic cloud storage with Supabase. Access PDFs anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2024 PDF SaaS. Built with Next.js, Supabase, and Puppeteer.</p>
        </div>
      </footer>
    </div>
  )
}
