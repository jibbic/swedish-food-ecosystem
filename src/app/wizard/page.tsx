'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from '@/components/ui/Badge'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function WizardPage() {
  const [step, setStep] = useState(1)
  const [selectedVerksamhet, setSelectedVerksamhet] = useState<string | null>(null)

  const { data: verksamheter } = trpc.verksamheter.list.useQuery()
  const { data: uppgiftskrav } = trpc.verksamheter.uppgiftskrav.useQuery(
    { verksamhetId: selectedVerksamhet! },
    { enabled: !!selectedVerksamhet }
  )

  const selectedVerksamhetData = verksamheter?.find(v => v.id === selectedVerksamhet)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Tillbaka till start
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Starta livsmedelsverksamhet</h1>
          <p className="text-gray-600 mt-2">
            Följ guiden för att hitta alla krav som gäller för din verksamhet
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Välj verksamhet
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Granska krav
            </span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Checklista
            </span>
          </div>
        </div>

        {/* Step 1: Välj verksamhetstyp */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vilken typ av verksamhet ska du starta?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {verksamheter?.map((v) => (
                <Card
                  key={v.id}
                  hoverable
                  onClick={() => setSelectedVerksamhet(v.id)}
                  className={selectedVerksamhet === v.id ? 'ring-2 ring-blue-600' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{v.namn}</CardTitle>
                      {selectedVerksamhet === v.id && (
                        <CheckCircle2 className="text-blue-600 flex-shrink-0" size={24} />
                      )}
                    </div>
                    <RiskBadge riskKlass={v.riskKlass} />
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {v.beskrivning}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedVerksamhet}
                size="lg"
              >
                Nästa <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Visa krav */}
        {step === 2 && selectedVerksamhetData && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Krav för {selectedVerksamhetData.namn}
            </h2>
            <p className="text-gray-600 mb-6">
              Baserat på din verksamhetstyp med riskklassning {selectedVerksamhetData.riskKlass}/5
            </p>

            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Översikt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {uppgiftskrav?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Uppgiftskrav</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedVerksamhetData.kräverGodkännande ? 'Ja' : 'Nej'}
                    </div>
                    <div className="text-sm text-gray-600">Godkännande krävs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedVerksamhetData.riskKlass}
                    </div>
                    <div className="text-sm text-gray-600">Risknivå</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mb-4">Alla uppgiftskrav</h3>
            <div className="space-y-4">
              {uppgiftskrav && uppgiftskrav.length > 0 ? (
                uppgiftskrav.map((krav) => (
                  <Card key={krav.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{krav.namn}</CardTitle>
                      <CardDescription>{krav.beskrivning}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {krav.lagrum && (
                          <div>
                            <span className="font-medium">Lagstöd:</span> {krav.lagrum}
                          </div>
                        )}
                        {krav.deadline && (
                          <div>
                            <span className="font-medium">Deadline:</span> {krav.deadline}
                          </div>
                        )}
                        {krav.url && (
                          <a
                            href={krav.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Läs mer →
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Inga specifika uppgiftskrav hittade. Detta kan bero på att data fortfarande importeras.
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                <ArrowLeft size={20} className="mr-2" /> Tillbaka
              </Button>
              <Button onClick={() => setStep(3)} size="lg">
                Skapa checklista <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Checklista */}
        {step === 3 && selectedVerksamhetData && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Din checklista
            </h2>

            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="text-green-600" size={48} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Checklistan är klar!
                    </h3>
                    <p className="text-gray-600">
                      Du har nu en komplett översikt över vad som krävs för att starta {selectedVerksamhetData.namn.toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold">Nästa steg:</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle>1. Registrera företag</CardTitle>
                  <CardDescription>
                    Registrera ditt företag hos Bolagsverket innan verksamheten startar.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. {selectedVerksamhetData.kräverGodkännande ? 'Ansök om godkännande' : 'Anmäl verksamhet'}</CardTitle>
                  <CardDescription>
                    Kontakta Livsmedelsverket för att {selectedVerksamhetData.kräverGodkännande ? 'ansöka om godkännande' : 'registrera din anläggning'}.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Uppfyll alla {uppgiftskrav?.length || 0} uppgiftskrav</CardTitle>
                  <CardDescription>
                    Gå igenom listan ovan och se till att du uppfyller alla krav.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Förbered för kontroll</CardTitle>
                  <CardDescription>
                    Med risknivå {selectedVerksamhetData.riskKlass} kan du förvänta dig kontroller från livsmedelsinspektionen.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} size="lg">
                <ArrowLeft size={20} className="mr-2" /> Tillbaka
              </Button>
              <Link href="/verksamheter" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full">
                  Se alla verksamhetstyper
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button size="lg" className="w-full">
                  Klar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
