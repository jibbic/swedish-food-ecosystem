'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, Globe, Mail, Phone, Search, Filter } from 'lucide-react'

export default function MyndigheterPage() {
  const [tipFilter, setTipFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: myndigheter, isLoading } = trpc.myndigheter.list.useQuery()

  // Filter myndigheter
  const filteredMyndigheter = myndigheter?.filter(m => {
    const matchesType = !tipFilter || m.typ === tipFilter
    const matchesSearch = !searchQuery || 
      m.namn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.beskrivning?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  // Get unique types
  const typer = Array.from(new Set(myndigheter?.map(m => m.typ) || []))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Myndigheter</h1>
          <p className="text-gray-600 mt-2">
            Översikt över myndigheter inom livsmedelssektorn
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Sök myndighet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <select
            value={tipFilter}
            onChange={(e) => setTipFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alla typer</option>
            {typer.map(typ => (
              <option key={typ} value={typ}>{typ}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        {myndigheter && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{myndigheter.length}</div>
                <div className="text-sm text-gray-600 mt-1">Totalt myndigheter</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {myndigheter.filter(m => m.typ === 'Statlig').length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Statliga</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {myndigheter.filter(m => m.typ === 'Regional').length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Regionala</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {myndigheter.filter(m => m.typ === 'Kommunal').length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Kommunala</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin" size={48} />
          </div>
        )}

        {/* Myndigheter list */}
        {filteredMyndigheter && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Visar {filteredMyndigheter.length} av {myndigheter?.length} myndigheter
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyndigheter.map(myndighet => {
                const kontakt = myndighet.kontakt ? JSON.parse(myndighet.kontakt) : null

                return (
                  <Card key={myndighet.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${myndighet.typ === 'Statlig' ? 'bg-green-100 text-green-800' : ''}
                          ${myndighet.typ === 'Regional' ? 'bg-purple-100 text-purple-800' : ''}
                          ${myndighet.typ === 'Kommunal' ? 'bg-orange-100 text-orange-800' : ''}
                        `}>
                          {myndighet.typ}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{myndighet.namn}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {myndighet.beskrivning && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {myndighet.beskrivning}
                        </p>
                      )}

                      {/* Ansvar och sektor */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {myndighet.ansvar && (
                          <div>
                            <span className="font-medium text-gray-700">Ansvar:</span>
                            <div className="text-gray-600 mt-1">{myndighet.ansvar}</div>
                          </div>
                        )}
                        {myndighet.sektor && (
                          <div>
                            <span className="font-medium text-gray-700">Sektor:</span>
                            <div className="text-gray-600 mt-1">{myndighet.sektor}</div>
                          </div>
                        )}
                      </div>

                      {/* Kontakt */}
                      {kontakt && (
                        <div className="space-y-2 pt-4 border-t">
                          {kontakt.url && (
                            <a
                              href={kontakt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <Globe size={16} />
                              Webbplats
                            </a>
                          )}
                          {kontakt.email && (
                            <a
                              href={`mailto:${kontakt.email}`}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <Mail size={16} />
                              {kontakt.email}
                            </a>
                          )}
                          {kontakt.telefon && (
                            <a
                              href={`tel:${kontakt.telefon}`}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <Phone size={16} />
                              {kontakt.telefon}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Link href={`/ekosystem?myndighet=${myndighet.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Se i graf
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {filteredMyndigheter && filteredMyndigheter.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Inga myndigheter hittades</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setTipFilter('')
              }}
              className="mt-4"
            >
              Rensa filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
