'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Loader2, Database, CheckCircle, XCircle, RefreshCcw } from 'lucide-react'

export default function DebugPage() {
  const { data: health, isLoading: healthLoading } = trpc.health.useQuery()
  const { data: overview, isLoading: overviewLoading, refetch } = trpc.debug.overview.useQuery()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database size={32} />
                Databasöversikt
              </h1>
              <p className="text-gray-600 mt-1">
                Debug-information om Neo4j-databasen
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Uppdatera
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Health Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Anslutningsstatus</h2>
          {healthLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {health?.status === 'ok' ? (
                  <>
                    <CheckCircle className="text-green-600" size={24} />
                    <span className="text-green-600 font-semibold">Neo4j ansluten</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-600" size={24} />
                    <span className="text-red-600 font-semibold">Neo4j ej ansluten</span>
                  </>
                )}
              </div>
              
              {health?.status === 'ok' && (
                <div className="bg-green-50 p-4 rounded-lg text-sm space-y-1">
                  <div><strong>Version:</strong> {health.neo4jVersion}</div>
                  <div><strong>Address:</strong> {health.address}</div>
                  <div><strong>Timestamp:</strong> {new Date(health.timestamp).toLocaleString('sv-SE')}</div>
                </div>
              )}
              
              {health?.status === 'error' && (
                <div className="bg-red-50 p-4 rounded-lg text-sm space-y-2">
                  {health.error && (
                    <div>
                      <strong className="text-red-900">Fel:</strong>
                      <div className="text-red-800 font-mono mt-1">{health.error}</div>
                    </div>
                  )}
                  {health.hint && (
                    <div className="text-red-800">💡 {health.hint}</div>
                  )}
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <strong className="text-red-900">Felsökning:</strong>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-red-800">
                      <li>Kontrollera att Neo4j körs: <code className="bg-white px-2 py-1 rounded">docker ps</code></li>
                      <li>Vänta 20 sekunder och klicka Uppdatera (Neo4j tar tid att starta)</li>
                      <li>Kontrollera lösenordet i .env filen (NEO4J_PASSWORD)</li>
                      <li>Se Neo4j-loggar: <code className="bg-white px-2 py-1 rounded">docker logs foodsystem-neo4j --tail 50</code></li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {overviewLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin" size={48} />
          </div>
        ) : overview ? (
          <>
            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Totalt antal noder</div>
                <div className="text-4xl font-bold text-blue-600">{overview.totalNodes}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Totalt antal relationer</div>
                <div className="text-4xl font-bold text-green-600">{overview.totalRels}</div>
              </div>
            </div>

            {overview.totalNodes === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ Databasen är tom!</h3>
                <p className="text-yellow-800 mb-3">
                  Du behöver fylla databasen med data genom att köra seed-scriptet.
                </p>
                <div className="bg-white rounded p-4 font-mono text-sm">
                  <div className="text-gray-700">$ npm run seed</div>
                </div>
                <p className="text-yellow-800 text-sm mt-3">
                  Detta kommer att ladda verksamhetstyper, myndigheter och uppgiftskrav från externa källor.
                </p>
              </div>
            )}

            {/* Node Counts by Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Noder per typ</h2>
              {overview.nodeCounts.length === 0 ? (
                <p className="text-gray-500">Inga noder hittades</p>
              ) : (
                <div className="space-y-3">
                  {overview.nodeCounts.map(({ label, count }) => (
                    <div key={label} className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-gray-900">{label}</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sample Data */}
            {Object.keys(overview.samples).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Exempel-data</h2>
                {Object.entries(overview.samples).map(([label, items]) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">{label}</h3>
                    {Array.isArray(items) && items.length > 0 ? (
                      <div className="space-y-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {Object.entries(item as Record<string, unknown>).slice(0, 5).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-semibold text-gray-700 min-w-[120px]">{key}:</span>
                                  <span className="text-gray-900 break-all">
                                    {typeof value === 'object' 
                                      ? JSON.stringify(value) 
                                      : String(value).length > 100 
                                        ? String(value).slice(0, 100) + '...' 
                                        : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Inga exempel tillgängliga</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-blue-900 mb-3">🔧 Snabbåtgärder</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Fyll databasen:</strong>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-blue-800">npm run seed</code>
                </div>
                <div>
                  <strong>Rensa databasen:</strong>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-blue-800">
                    docker compose down -v && docker compose up -d
                  </code>
                </div>
                <div>
                  <strong>Neo4j Browser:</strong>
                  <a href="http://localhost:7474" target="_blank" className="ml-2 text-blue-600 hover:underline">
                    http://localhost:7474
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Kunde inte hämta databasöversikt. Kontrollera att Neo4j körs.</p>
          </div>
        )}
      </main>
    </div>
  )
}
