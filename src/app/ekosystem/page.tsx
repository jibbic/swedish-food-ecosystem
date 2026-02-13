'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { EcosystemGraph } from '@/components/graph/EcosystemGraph'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, Filter, Search, X } from 'lucide-react'

export default function EkosystemPage() {
  const [filters, setFilters] = useState<{
    kategori?: string
    riskKlass?: number
  }>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: graphData, isLoading } = trpc.graph.ecosystem.useQuery(filters)
  const { data: searchResults } = trpc.graph.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  )

  // Get details for selected node
  const selectedNode = graphData?.nodes.find(n => n.id === selectedNodeId)

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    setSelectedNodeId(nodeId)
    setSelectedNodeType(nodeType)
  }

  const clearFilters = () => {
    setFilters({})
    setSelectedNodeId(null)
    setSelectedNodeType(null)
  }

  const kategorier = ['Restaurang', 'Bageri/Konditori', 'Butik', 'Catering', 'Köttproduktion', 'Fiskberedning']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ekosystemet</h1>
              <p className="text-gray-600 mt-1">
                Interaktiv graf över livsmedelssektorns relationer
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} className="mr-2" />
              {showFilters ? 'Dölj filter' : 'Visa filter'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search size={20} />
                  Sök
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Sök verksamhet, krav..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                    {searchResults.map(node => (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id)
                          setSelectedNodeType(node.type)
                          setSearchQuery('')
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                      >
                        <div className="font-medium">{node.label}</div>
                        <div className="text-xs text-gray-500">{node.type}</div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filter</CardTitle>
                    {(filters.kategori || filters.riskKlass) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Rensa
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Kategori filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verksamhetskategori
                    </label>
                    <select
                      value={filters.kategori || ''}
                      onChange={(e) => setFilters({ ...filters, kategori: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Alla</option>
                      {kategorier.map(kat => (
                        <option key={kat} value={kat}>{kat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Risk filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min risknivå: {filters.riskKlass || 1}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={filters.riskKlass || 1}
                      onChange={(e) => setFilters({ ...filters, riskKlass: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (Låg)</span>
                      <span>5 (Hög)</span>
                    </div>
                  </div>

                  {/* Stats */}
                  {graphData && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Noder:</span>
                          <span className="font-semibold">{graphData.nodes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relationer:</span>
                          <span className="font-semibold">{graphData.edges.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected node details */}
            {selectedNode && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        {selectedNodeType}
                      </div>
                      <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNodeId(null)
                        setSelectedNodeType(null)
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedNodeType === 'Verksamhetstyp' && (
                    <>
                      <div>
                        <span className="font-medium">Kod:</span> {selectedNode.properties.kod}
                      </div>
                      <div>
                        <span className="font-medium">Risknivå:</span> {selectedNode.properties.riskKlass}/5
                      </div>
                      <div>
                        <span className="font-medium">Kategori:</span> {selectedNode.properties.kategori}
                      </div>
                      <Link href={`/verksamheter/${selectedNode.id}`}>
                        <Button size="sm" className="w-full mt-3">
                          Se detaljer →
                        </Button>
                      </Link>
                    </>
                  )}
                  {selectedNodeType === 'Myndighet' && (
                    <>
                      <div>
                        <span className="font-medium">Typ:</span> {selectedNode.properties.typ}
                      </div>
                      {selectedNode.properties.kontakt && (
                        <div>
                          <span className="font-medium">Webb:</span>{' '}
                          <a
                            href={JSON.parse(selectedNode.properties.kontakt).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Besök →
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {selectedNodeType === 'Uppgiftskrav' && (
                    <>
                      <div className="text-gray-700">
                        {selectedNode.properties.beskrivning}
                      </div>
                      {selectedNode.properties.lagrum && (
                        <div>
                          <span className="font-medium">Lagstöd:</span> {selectedNode.properties.lagrum}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>🖱️ <strong>Klicka</strong> på noder för att se detaljer</p>
                <p>🔍 <strong>Zooma</strong> med mushjul eller knappar</p>
                <p>✋ <strong>Dra</strong> för att panorera</p>
                <p>🎨 Färger visar olika nodtyper</p>
              </CardContent>
            </Card>
          </div>

          {/* Graph */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-white rounded-lg border">
                <Loader2 className="animate-spin" size={48} />
              </div>
            ) : graphData ? (
              <EcosystemGraph
                data={graphData}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-white rounded-lg border">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-semibold mb-2">Ingen data hittades</p>
                  <p className="text-sm">Prova att justera filtren eller seed databasen</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
