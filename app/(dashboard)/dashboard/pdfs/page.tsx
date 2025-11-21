'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Pdf {
  id: string
  filename: string
  public_url: string
  file_size: number
  page_count: number
  format: string
  source_type: string
  storage_path: string
  created_at: string
}

export default function PdfsPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState<{ id: string; storage_path: string; filename: string } | null>(null)
  const limit = 20

  useEffect(() => {
    fetchPdfs()
  }, [page])

  async function fetchPdfs() {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setError('Please sign in to view your PDFs')
        return
      }

      // Fetch PDFs directly from Supabase
      const { data, error: fetchError } = await supabase
        .from('pdfs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setPdfs(data || [])
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Failed to fetch PDFs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function deletePdf(pdfId: string, storagePath: string) {
    try {
      const supabase = createClient()

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([storagePath])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        alert('Failed to delete PDF file from storage')
        return
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('pdfs')
        .delete()
        .eq('id', pdfId)

      if (dbError) {
        console.error('Database deletion error:', dbError)
        alert('Failed to delete PDF record from database')
        return
      }

      // Refresh the list
      await fetchPdfs()
      setDeleteDialogOpen(false)
      setPdfToDelete(null)
    } catch (err) {
      console.error('Failed to delete PDF:', err)
      alert('An error occurred while deleting the PDF')
    }
  }

  function handleDeleteClick(pdf: Pdf) {
    setPdfToDelete({
      id: pdf.id,
      storage_path: pdf.storage_path,
      filename: pdf.filename
    })
    setDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (pdfToDelete) {
      deletePdf(pdfToDelete.id, pdfToDelete.storage_path)
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading && pdfs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDFs</h1>
          <p className="text-gray-600 mt-1">View and manage your generated PDFs</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Loading PDFs...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDFs</h1>
          <p className="text-gray-600 mt-1">View and manage your generated PDFs</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PDFs</h1>
        <p className="text-gray-600 mt-1">View and manage your generated PDFs</p>
      </div>

      {pdfs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No PDFs Yet</CardTitle>
            <CardDescription>
              Your generated PDFs will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Create your first PDF using the API or MCP server.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {pdfs.map((pdf) => (
              <Card key={pdf.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pdf.filename}</CardTitle>
                      <CardDescription>
                        Created {formatDate(pdf.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{pdf.format}</Badge>
                      <Badge variant="secondary">{pdf.source_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="text-sm font-medium">{formatBytes(pdf.file_size)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pages</p>
                      <p className="text-sm font-medium">{pdf.page_count || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Format</p>
                      <p className="text-sm font-medium">{pdf.format}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="text-sm font-medium capitalize">{pdf.source_type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(pdf.public_url, '_blank')}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(pdf.public_url)
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(pdf)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{pdfToDelete?.filename}</strong>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPdfToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={pdfs.length < limit}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
