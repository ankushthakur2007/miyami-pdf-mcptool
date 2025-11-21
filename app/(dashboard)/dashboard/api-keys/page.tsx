'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { CreateApiKeySchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'

type CreateApiKeyFormValues = z.infer<typeof CreateApiKeySchema>

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  rate_limit_per_hour: number
  is_active: boolean
  created_at: string
  last_used_at: string | null
  total_requests: number
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  async function fetchApiKeys() {
    try {
      setLoadingKeys(true)
      const response = await fetch('/api/keys')
      const data = await response.json()

      if (response.ok) {
        setApiKeys(data.api_keys || [])
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err)
    } finally {
      setLoadingKeys(false)
    }
  }

  async function deleteApiKey(keyId: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchApiKeys()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete API key')
      }
    } catch (err) {
      alert('Failed to delete API key')
    }
  }

  async function toggleApiKey(keyId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        await fetchApiKeys()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update API key')
      }
    } catch (err) {
      alert('Failed to update API key')
    }
  }

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(CreateApiKeySchema),
    defaultValues: {
      name: '',
      rate_limit_per_hour: 1000,
    },
  })

  async function onSubmit(values: CreateApiKeyFormValues) {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create API key')
        return
      }

      setCreatedKey(data.api_key)
      form.reset()
      setShowCreateForm(false)
      await fetchApiKeys() // Refresh the list
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">
            Manage your API keys for accessing the PDF generation API
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Key'}
        </Button>
      </div>

      {/* Created Key Display */}
      {createdKey && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700">API Key Created Successfully</CardTitle>
            <CardDescription>
              Make sure to copy your API key now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-100 rounded font-mono text-sm break-all">
                {createdKey}
              </code>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey)
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key to access the PDF generation API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Production API Key"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to identify this API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate_limit_per_hour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (per hour)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of API requests per hour
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create API Key'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for accessing the PDF generation API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingKeys ? (
            <p className="text-sm text-gray-500">Loading API keys...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-gray-500">
              No API keys yet. Create your first API key to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{key.name}</h3>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded">{key.key_prefix}_...</code>
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Rate limit: {key.rate_limit_per_hour}/hour</span>
                      <span>Requests: {key.total_requests}</span>
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleApiKey(key.id, key.is_active)}
                    >
                      {key.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
