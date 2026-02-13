'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, TrendingUp, BarChart3, PieChart, Network } from 'lucide-react'

export default function StatistikPage() {
  const { data: verksamheter, isLoading: loadingVerksamheter } = trpc.verksamheter.list.useQuery()
  const { data: myndigheter, isLoading: loadingMyndigheter } = trpc.myndigheter.list.useQuery()
  const { data: graphData, isLoading: loadingGraph } = trpc.graph.ecosystem.useQuery({})

  const isLoading = loadingVerksamheter || loadingMyndigheter || loadingGraph

  // Calculate statistics
  const stats = {
    totalVerksamheter: verksamheter?.length || 0,
    totalMyndigheter: myndigheter?.length || 0,
    totalNodes: graphData?.nodes.length || 0,
    totalEdges: graphData?.edges.length || 0,
  }

  // Risk distribution
  const riskDistribution = verksamheter?.reduce((acc, v) => {
    acc[v.riskKlass] = (acc[v.riskKlass] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Category distribution
  const kategoriDistribution = verksamheter?.reduce((acc, v) => {
    acc[v.kategori] = (acc[v.kategori] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Myndighet type distribution
  const myndighetTypeDistribution = myndigheter?.reduce((acc, m) => {
    acc[m.typ] = (acc[m.typ] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Top myndigheter by connections (approximation based on graph data)
  const myndighetConnections = graphData?.edges
    .filter(e => e.type === 'STÄLLS_AV')
    .reduce((acc, edge) => {
      acc[edge.target] = (acc[edge.target] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topMyndigheter = myndighetConnections
    ? Object.entries(myndighetConnections)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({
          id,
          name: graphData?.nodes.find(n => n.id === id)?.label || id,
          count,
        }))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 size={36} className="text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Statistik & Analys</h1>
              <p className="text-gray-600 mt-1">
                Översikt och insikter om livsmedelssektorn
              </p>
            </div>
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
            {/* Key metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.totalVerksamheter}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Verksamhetstyper</div>
                    </div>
                    <Network className="text-green-600 opacity-50" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.totalMyndigheter}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Myndigheter</div>
                    </div>
                    <PieChart className="text-blue-600 opacity-50" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {stats.totalNodes}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Totala noder</div>
                    </div>
                    <BarChart3 className="text-orange-600 opacity-50" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {stats.totalEdges}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Relationer</div>
                    </div>
                    <TrendingUp className="text-purple-600 opacity-50" size={40} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Riskfördelning</CardTitle>
                <CardDescription>
                  Antal verksamhetstyper per risknivå
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(risk => {
                    const count = riskDistribution?.[risk] || 0
                    const percentage = stats.totalVerksamheter > 0
                      ? (count / stats.totalVerksamheter) * 100
                      : 0
                    
                    return (
                      <div key={risk}>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="font-medium">
                            Nivå {risk} - {getRiskLabel(risk)}
                          </span>
                          <span className="text-gray-600">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getRiskColor(risk)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Category distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Verksamheter per kategori</CardTitle>
                  <CardDescription>
                    Fördelning av typer inom olika kategorier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(kategoriDistribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([kategori, count]) => {
                        const percentage = stats.totalVerksamheter > 0
                          ? (count / stats.totalVerksamheter) * 100
                          : 0
                        
                        return (
                          <div key={kategori}>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="font-medium">{kategori}</span>
                              <span className="text-gray-600">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full bg-green-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Myndighet types */}
              <Card>
                <CardHeader>
                  <CardTitle>Myndigheter per typ</CardTitle>
                  <CardDescription>
                    Statlig, regional eller kommunal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(myndighetTypeDistribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([typ, count]) => {
                        const percentage = stats.totalMyndigheter > 0
                          ? (count / stats.totalMyndigheter) * 100
                          : 0
                        
                        return (
                          <div key={typ}>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="font-medium">{typ}</span>
                              <span className="text-gray-600">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getTypeColor(typ)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top myndigheter */}
            <Card>
              <CardHeader>
                <CardTitle>Mest omfattande myndigheter</CardTitle>
                <CardDescription>
                  Myndigheter med flest uppgiftskrav
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMyndigheter.map((myndighet, index) => (
                    <div key={myndighet.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{myndighet.name}</div>
                        <div className="text-sm text-gray-600">
                          {myndighet.count} krav
                        </div>
                      </div>
                      <Link href={`/ekosystem?myndighet=${myndighet.id}`}>
                        <Button variant="outline" size="sm">
                          Visa i graf
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/ekosystem">
                <Button size="lg">
                  Utforska i ekosystemgrafen
                </Button>
              </Link>
              <Link href="/verksamheter">
                <Button variant="outline" size="lg">
                  Alla verksamhetstyper
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getRiskLabel(risk: number): string {
  if (risk === 1) return 'Mycket låg'
  if (risk === 2) return 'Låg'
  if (risk === 3) return 'Medel'
  if (risk === 4) return 'Hög'
  return 'Mycket hög'
}

function getRiskColor(risk: number): string {
  if (risk <= 2) return 'bg-green-500'
  if (risk === 3) return 'bg-yellow-500'
  if (risk === 4) return 'bg-orange-500'
  return 'bg-red-500'
}

function getTypeColor(typ: string): string {
  if (typ === 'Statlig') return 'bg-green-500'
  if (typ === 'Regional') return 'bg-purple-500'
  return 'bg-orange-500'
}
