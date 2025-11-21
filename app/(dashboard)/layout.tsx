import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                PDF SaaS
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="px-4 py-6 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              API Keys
            </Link>
            <Link
              href="/dashboard/pdfs"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              PDFs
            </Link>
            <Link
              href="/dashboard/usage"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Usage
            </Link>
            <Link
              href="/dashboard/docs"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Documentation
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
