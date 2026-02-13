'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react'

export default function OverlappPage() {
  const [minOverlap, setMinOverlap] = useState(2)
  
  const { data: graphData, isLoading } = trpc.graph.ecosystem.useQuery({})

  // Calculate overlaps - which uppgiftskrav are required by multiple verksamhetstyper
  const uppgiftskravOverlap = useMemo(() => {
    if (!graphData) return []

    // Map: uppgiftskrav ID -> verksamhetstyp IDs that must fulfill it
    const kravToVerksamhet = new Map<string, Set<string>>()

    graphData.edges
      .filter(e => e.type === 'MÅSTE_UPPFYLLA')
      .forEach(edge => {
        if (!kravToVerksamhet.has(edge.target)) {
          kravToVerksamhet.set(edge.target, new Set())
        }
        kravToVerksamhet.get(edge.target)!.add(edge.source)
      })

    // Find krav with multiple verksamhetstyper
    const overlaps = Array.from(kravToVerksamhet.entries())
      .map(([kravId, verksamhetIds]) => {
        const kravNode = graphData.nodes.find(n => n.id === kravId)
        const verksamhetNodes = Array.from(verksamhetIds)
          .map(id => graphData.nodes.find(n => n.id === id))
          .filter(Boolean)

        return {
          kravId,
          kravNamn: kravNode?.label || kravId,
          kravBeskrivning: kravNode?.properties.beskrivning,
          myndighet: graphData.edges
            .filter(e => e.type === 'STÄLLS_AV' && e.source === kravId)
            .map(e => graphData.nodes.find(n => n.id === e.target)?.label)
            .filter(Boolean)[0],
          verksamheter: verksamhetNodes,
          count: verksamhetIds.size,
        }
      })
      .filter(o => o.count >= minOverlap)
      .sort((a, b) => b.count - a.count)

    return overlaps
  }, [graphData, minOverlap])

  // Calculate myndighet overlaps - which myndigheter require data from the same verksamheter
  const myndighetOverlap = useMemo(() => {
    if (!graphData) return []

    // Map: verksamhet ID -> myndighet IDs that have requirements for it
    const verksamhetToMyndigheter = new Map<string, Set<string>>()

    // First get all krav per verksamhet
    const verksamhetKrav = new Map<string, Set<string>>()
    graphData.edges
      .filter(e => e.type === 'MÅSTE_UPPFYLLA')
      .forEach(edge => {
        if (!verksamhetKrav.has(edge.source)) {
          verksamhetKrav.set(edge.source, new Set())
        }
        verksamhetKrav.get(edge.source)!.add(edge.target)
      })

    // Then map krav to myndigheter
    verksamhetKrav.forEach((kravIds, verksamhetId) => {
      const myndigheter = new Set<string>()
      
      kravIds.forEach(kravId => {
        graphData.edges
          .filter(e => e.type === 'STÄLLS_AV' && e.source === kravId)
          .forEach(e => myndigheter.add(e.target))
      })

      if (myndigheter.size > 1) {
        verksamhetToMyndigheter.set(verksamhetId, myndigheter)
      }
    })

    return Array.from(verksamhetToMyndigheter.entries())
      .map(([verksamhetId, myndighetIds]) => {
        const verksamhetNode = graphData.nodes.find(n => n.id === verksamhetId)
        const myndighetNodes = Array.from(myndighetIds)
          .map(id => graphData.nodes.find(n => n.id === id))
          .filter(Boolean)

        return {
          verksamhetId,
          verksamhetNamn: verksamhetNode?.label || verksamhetId,
          myndigheter: myndighetNodes,
          count: myndighetIds.size,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [graphData])

  const exportData = () => {
    const csvContent = [
      ['Typ', 'Namn', 'Antal överlapp', 'Detaljer'],
      ...uppgiftskravOverlap.map(o => [
        'Uppgiftskrav',
        o.kravNamn,
        o.count,
        o.verksamheter.map(v => v?.label).join('; ')
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'overlapp-analys.csv'
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={36} className="text-orange-600" />
                <h1 className="text-4xl font-bold text-gray-900">Överlapp-analys</h1>
              </div>
              <p className="text-gray-600 mt-1">
                Identifiera redundanta krav och möjligheter för förenkling
              </p>
            </div>
            <Button onClick={exportData} variant="outline">
              <Download size={20} className="mr-2" />
              Exportera
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin" size={48} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600">
                    {uppgiftskravOverlap.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Delade uppgiftskrav
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Krav som gäller för flera verksamhetstyper
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600">
                    {myndighetOverlap.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Verksamheter med flera myndigheter
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Verksamheter som rapporterar till 2+ myndigheter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <CheckCircle className="text-green-600 mb-2" size={32} />
                  <div className="text-sm font-semibold text-gray-900">
                    Förenklingsmöjligheter
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Harmonisera krav och minska dubbelrapportering
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Minsta antal överlapp:
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={minOverlap}
                    onChange={(e) => setMinOverlap(parseInt(e.target.value))}
                    className="flex-1 max-w-xs"
                  />
                  <span className="text-sm font-semibold text-gray-900 w-8">
                    {minOverlap}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Uppgiftskrav overlaps */}
            <Card>
              <CardHeader>
                <CardTitle>Delade uppgiftskrav</CardTitle>
                <CardDescription>
                  Krav som flera verksamhetstyper måste uppfylla
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uppgiftskravOverlap.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Inga överlapp hittades med nuvarande filter</p>
                    <Button
                      variant="outline"
                      onClick={() => setMinOverlap(2)}
                      className="mt-4"
                    >
                      Återställ filter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uppgiftskravOverlap.map(overlap => (
                      <div
                        key={overlap.kravId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {overlap.kravNamn}
                            </h3>
                            {overlap.kravBeskrivning && (
                              <p className="text-sm text-gray-600 mt-1">
                                {overlap.kravBeskrivning}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {overlap.count} verksamheter
                            </div>
                          </div>
                        </div>

                        {overlap.myndighet && (
                          <div className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Myndighet:</span> {overlap.myndighet}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Gäller för:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {overlap.verksamheter.map(v => (
                              <Link
                                key={v?.id}
                                href={`/verksamheter/${v?.id}`}
                                className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-xs hover:bg-green-100"
                              >
                                {v?.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Myndighet overlaps */}
            <Card>
              <CardHeader>
                <CardTitle>Verksamheter med flera myndigheter</CardTitle>
                <CardDescription>
                  Verksamhetstyper som måste rapportera till flera myndigheter
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myndighetOverlap.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Ingen data tillgänglig</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myndighetOverlap.map(overlap => (
                      <div
                        key={overlap.verksamhetId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {overlap.verksamhetNamn}
                          </h3>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {overlap.count} myndigheter
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {overlap.myndigheter.map(m => (
                            <span
                              key={m?.id}
                              className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
                            >
                              {m?.label}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <Link href={`/verksamheter/${overlap.verksamhetId}`}>
                            <Button variant="outline" size="sm">
                              Se detaljer →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>💡 Insikter för myndighetsanalytiker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>Delade krav</strong> indikerar möjligheter för standardisering och harmonisering 
                  mellan olika verksamhetstyper.
                </p>
                <p>
                  <strong>Flera myndigheter per verksamhet</strong> kan betyda onödig dubbelrapportering. 
                  Överväg samordnade datainsamlingar eller gemensamma register.
                </p>
                <p>
                  <strong>Förenklingsmöjligheter:</strong> Identifiera krav där data kan delas mellan 
                  myndigheter istället för att varje myndighet samlar in separat.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
