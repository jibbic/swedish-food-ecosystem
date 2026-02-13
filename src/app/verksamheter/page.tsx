'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/Badge'
import { Loader2 } from 'lucide-react'

export default function VerksamheterPage() {
  const { data: verksamheter, isLoading, error } = trpc.verksamheter.list.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading verksamhetstyper: {error.message}</p>
        </div>
      </div>
    )
  }

  // Group by kategori
  const grouped = verksamheter?.reduce((acc, v) => {
    if (!acc[v.kategori]) acc[v.kategori] = []
    acc[v.kategori].push(v)
    return acc
  }, {} as Record<string, typeof verksamheter>)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Verksamhetstyper</h1>
          <p className="text-gray-600 mt-2">
            Alla livsmedelsverksamheter med riskklassning och krav
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {grouped && Object.entries(grouped).map(([kategori, items]) => (
          <section key={kategori} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{kategori}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((v) => (
                <Link key={v.id} href={`/verksamheter/${v.id}`}>
                  <Card hoverable>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex-1">{v.namn}</CardTitle>
                        <span className="text-sm text-gray-500 ml-2">{v.kod}</span>
                      </div>
                      <div className="mt-2">
                        <RiskBadge riskKlass={v.riskKlass} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {v.beskrivning}
                      </CardDescription>
                      <div className="mt-4 text-sm text-gray-500">
                        {v.kräverGodkännande ? '✓ Kräver godkännande' : '✓ Kräver registrering'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
