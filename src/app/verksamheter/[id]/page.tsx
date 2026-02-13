'use client'

import { use } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from '@/components/ui/Badge'
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

export default function VerksamhetstypDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const { data: verksamhet, isLoading } = trpc.verksamheter.byId.useQuery({ verksamhetId: id })
  const { data: uppgiftskrav } = trpc.verksamheter.uppgiftskrav.useQuery({ verksamhetId: id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (!verksamhet) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verksamhetstyp hittades inte</h1>
        <Link href="/verksamheter">
          <Button>Tillbaka till alla verksamheter</Button>
        </Link>
      </div>
    )
  }

  // Group uppgiftskrav by myndighet
  const kravPerMyndighet = uppgiftskrav?.reduce((acc, krav) => {
    const myndighetNamn = krav.myndighet?.namn || 'Okänd'
    if (!acc[myndighetNamn]) {
      acc[myndighetNamn] = []
    }
    acc[myndighetNamn].push(krav)
    return acc
  }, {} as Record<string, typeof uppgiftskrav>)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/verksamheter" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka till alla verksamheter
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{verksamhet.namn}</h1>
                <RiskBadge riskKlass={verksamhet.riskKlass} />
              </div>
              <p className="text-gray-600 text-lg mt-2">{verksamhet.beskrivning}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Översikt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Verksamhetskod</div>
                    <div className="font-semibold">{verksamhet.kod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Kategori</div>
                    <div className="font-semibold">{verksamhet.kategori}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Risknivå</div>
                    <div className="font-semibold">
                      {verksamhet.riskKlass}/5 - {getRiskLabel(verksamhet.riskKlass)}
                    </div>
                  </div>
                </div>

                {verksamhet.riskpoang && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Riskpoäng</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getRiskColor(verksamhet.riskKlass)} bg-opacity-80`}
                          style={{ width: `${(verksamhet.riskpoang / 50) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold">{verksamhet.riskpoang}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uppgiftskrav */}
            <Card>
              <CardHeader>
                <CardTitle>Uppgiftskrav ({uppgiftskrav?.length || 0})</CardTitle>
                <CardDescription>
                  Krav som denna verksamhetstyp måste uppfylla, grupperade per myndighet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uppgiftskrav || uppgiftskrav.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Inga uppgiftskrav registrerade ännu</p>
                    <p className="text-sm mt-2">Detta kan bero på att databasen inte är seedat</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(kravPerMyndighet || {}).map(([myndighetNamn, krav]) => (
                      <div key={myndighetNamn} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          {myndighetNamn}
                          <span className="text-sm font-normal text-gray-500">
                            ({krav.length} {krav.length === 1 ? 'krav' : 'krav'})
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {krav.map(k => (
                            <div key={k.id} className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">{k.namn}</h4>
                              {k.beskrivning && (
                                <p className="text-sm text-gray-600 mb-2">{k.beskrivning}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {k.kategori && (
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    {k.kategori}
                                  </span>
                                )}
                                {k.lagrum && (
                                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                    Lagstöd: {k.lagrum}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Åtgärder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/wizard?verksamhet=${id}`}>
                  <Button className="w-full">
                    <CheckCircle size={20} className="mr-2" />
                    Starta krav-checklista
                  </Button>
                </Link>
                <Link href={`/ekosystem?verksamhet=${id}`}>
                  <Button variant="outline" className="w-full">
                    Visualisera i graf
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Risk explanation */}
            <Card className={`border-l-4 ${getRiskBorderColor(verksamhet.riskKlass)}`}>
              <CardHeader>
                <CardTitle className="text-lg">Risknivå: {getRiskLabel(verksamhet.riskKlass)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                {getRiskDescription(verksamhet.riskKlass)}
              </CardContent>
            </Card>

            {/* Myndigheter */}
            {uppgiftskrav && uppgiftskrav.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Berörda myndigheter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(uppgiftskrav.map(k => k.myndighet?.namn).filter(Boolean))).map(namn => (
                      <div key={namn} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>{namn}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/myndigheter" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Se alla myndigheter <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Använd <strong>krav-checklistan</strong> för att säkerställa att du uppfyller alla krav.</p>
                <p>Kontakta relevanta myndigheter om du har frågor om specifika krav.</p>
                <p>Risknivån påverkar hur ofta din verksamhet kan bli inspekterad.</p>
              </CardContent>
            </Card>
          </div>
        </div>
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

function getRiskBorderColor(risk: number): string {
  if (risk <= 2) return 'border-green-500'
  if (risk === 3) return 'border-yellow-500'
  if (risk === 4) return 'border-orange-500'
  return 'border-red-500'
}

function getRiskDescription(risk: number): string {
  if (risk === 1) return 'Denna verksamhetstyp bedöms ha mycket låg risk för folkhälsan. Färre krav och inspektioner.'
  if (risk === 2) return 'Låg risk för folkhälsan. Normal nivå av tillsyn och kontrollkrav.'
  if (risk === 3) return 'Medelhög risk. Kräver noggrann efterlevnad av livsmedelssäkerhetskrav och regelbunden tillsyn.'
  if (risk === 4) return 'Hög risk för folkhälsan. Striktare krav på egenkontroll och mer frekvent tillsyn.'
  return 'Mycket hög risk. Omfattande krav på livsmedelssäkerhet, dokumentation och frekvent kontroll av myndigheter.'
}
