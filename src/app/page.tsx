import Link from 'next/link'
import { ArrowRight, Network, Building2, FileText, BarChart3, AlertTriangle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Swedish Food Ecosystem</h1>
              <p className="text-sm text-gray-600">Kunskapsgraf för livsmedelssektorn</p>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/ekosystem" className="text-gray-700 hover:text-blue-600 transition">
                Ekosystem
              </Link>
              <Link href="/verksamheter" className="text-gray-700 hover:text-blue-600 transition">
                Verksamheter
              </Link>
              <Link href="/myndigheter" className="text-gray-700 hover:text-blue-600 transition">
                Myndigheter
              </Link>
              <Link href="/statistik" className="text-gray-700 hover:text-blue-600 transition">
                Statistik
              </Link>
              <Link href="/overlapp" className="text-gray-700 hover:text-blue-600 transition">
                Överlapp
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Navigera Sveriges<br />
            <span className="text-blue-600">Livsmedelsekosystem</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            En interaktiv kunskapsgraf som kartlägger myndigheter, uppgiftskrav och 
            verksamhetstyper inom livsmedelssektorn. För företagare och myndigheter.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/wizard" 
              className="px-8 -4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              Starta här
              <ArrowRight size={20} />
            </Link>
            <Link 
              href="/ekosystem" 
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Utforska grafen
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link href="/ekosystem">
            <FeatureCard
              icon={<Network className="text-blue-600" size={32} />}
              title="Interaktiv Graf"
              description="Visualisera relationer mellan myndigheter, krav och verksamhetstyper i en kraftfull knowledge graph."
            />
          </Link>
          <Link href="/verksamheter">
            <FeatureCard
              icon={<Building2 className="text-green-600" size={32} />}
              title="Verksamhetstyper"
              description="Hitta din verksamhetstyp och se alla relevanta krav, riskklassning och myndighetskontakter."
            />
          </Link>
          <Link href="/wizard">
            <FeatureCard
              icon={<FileText className="text-orange-600" size={32} />}
              title="Krav-checklista"
              description="Guidad wizard som hjälper dig hitta rätt krav för din verksamhet och skapa en checklista."
            />
          </Link>
          <Link href="/myndigheter">
            <FeatureCard
              icon={<Building2 className="text-purple-600" size={32} />}
              title="Myndigheter"
              description="Komplett översikt över alla myndigheter med kontaktinfo, ansvar och sektor."
            />
          </Link>
          <Link href="/statistik">
            <FeatureCard
              icon={<BarChart3 className="text-indigo-600" size={32} />}
              title="Statistik & Analys"
              description="Insikter om ekosystemet: riskfördelning, kategorianalys och centrala aktörer."
            />
          </Link>
          <Link href="/overlapp">
            <FeatureCard
              icon={<AlertTriangle className="text-amber-600" size={32} />}
              title="Överlapp-analys"
              description="Identifiera redundanta krav och möjligheter för förenkling mellan myndigheter."
            />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <StatCard number="87" label="Verksamhetstyper" />
            <StatCard number="245" label="Uppgiftskrav" />
            <StatCard number="15" label="Myndigheter" />
            <StatCard number="500+" label="Relationer" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Redo att utforska?
          </h3>
          <p className="text-gray-600 mb-8">
            Börja med vår guide för att hitta rätt krav för din verksamhet.
          </p>
          <Link 
            href="/wizard" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Starta wizard
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2026 Swedish Food Ecosystem. Öppen data från Uppgiftskrav.se och Livsmedelsverket.
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="https://github.com/..." className="hover:text-blue-600">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-200">{label}</div>
    </div>
  )
}
