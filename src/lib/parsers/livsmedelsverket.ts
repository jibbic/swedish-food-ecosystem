import type { Verksamhetstyp } from '@/types/neo4j'

interface LivsmedelsverketVerksamhet {
  kod: string
  namn: string
  beskrivning?: string
  riskpoang?: number
  kravNiva?: 'Registrering' | 'Godkännande'
}

export async function fetchVerksamhetstyper(): Promise<Verksamhetstyp[]> {
  // TODO: Replace with actual API endpoint when available
  const apiUrl = process.env.LIVSMEDELSVERKET_API_URL || 'https://dataportal.livsmedelsverket.se/riskklassningkodverk/api'
  
  console.log('📥 Fetching verksamhetstyper från Livsmedelsverket API')
  
  try {
    // For MVP: Use mock data until API endpoint is confirmed
    // const response = await fetch(`${apiUrl}/verksamhetstyper`)
    // const data = await response.json()

    // Mock data for MVP
    const mockData: LivsmedelsverketVerksamhet[] = [
      {
        kod: '01.01',
        namn: 'Restaurang med varm matlagning',
        beskrivning: 'Servering av varm mat tillagad på plats',
        riskpoang: 60,
        kravNiva: 'Registrering',
      },
      {
        kod: '01.02',
        namn: 'Restaurang utan varm matlagning',
        beskrivning: 'Servering av enbart förtillverkad mat',
        riskpoang: 30,
        kravNiva: 'Registrering',
      },
      {
        kod: '02.01',
        namn: 'Bageri',
        beskrivning: 'Tillverkning av bröd och bakverk',
        riskpoang: 40,
        kravNiva: 'Registrering',
      },
      {
        kod: '02.02',
        namn: 'Konditori',
        beskrivning: 'Tillverkning av konditorivaror, ev. café',
        riskpoang: 50,
        kravNiva: 'Registrering',
      },
      {
        kod: '03.01',
        namn: 'Livsmedelsbutik',
        beskrivning: 'Allmän livsmedelsbutik',
        riskpoang: 35,
        kravNiva: 'Registrering',
      },
      {
        kod: '03.02',
        namn: 'Livsmedelsbutik enbart förpackade varor',
        beskrivning: 'Försäljning av enbart förpackade livsmedel',
        riskpoang: 15,
        kravNiva: 'Registrering',
      },
      {
        kod: '04.01',
        namn: 'Catering-verksamhet',
        beskrivning: 'Tillagning och leverans av mat',
        riskpoang: 70,
        kravNiva: 'Registrering',
      },
      {
        kod: '05.01',
        namn: 'Slakteri',
        beskrivning: 'Slakt och styckning av djur',
        riskpoang: 90,
        kravNiva: 'Godkännande',
      },
      {
        kod: '05.02',
        namn: 'Charkuteriverksamhet',
        beskrivning: 'Tillverkning av charkuteriprodukter',
        riskpoang: 75,
        kravNiva: 'Godkännande',
      },
      {
        kod: '06.01',
        namn: 'Fiskberedning',
        beskrivning: 'Beredning och förpackning av fisk',
        riskpoang: 80,
        kravNiva: 'Godkännande',
      },
    ]

    const verksamhetstyper: Verksamhetstyp[] = mockData.map(v => ({
      id: `vt-${v.kod.replace('.', '-')}`,
      kod: v.kod,
      namn: v.namn,
      beskrivning: v.beskrivning || '',
      riskKlass: calculateRiskKlass(v.riskpoang || 0),
      kräverGodkännande: v.kravNiva === 'Godkännande',
      kräverRegistrering: v.kravNiva === 'Registrering',
      kategori: extractKategori(v.namn),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    console.log(`✅ Parsed ${verksamhetstyper.length} verksamhetstyper`)

    return verksamhetstyper
  } catch (error) {
    console.error('❌ Error fetching verksamhetstyper:', error)
    throw error
  }
}

function calculateRiskKlass(riskpoang: number): 1 | 2 | 3 | 4 | 5 {
  if (riskpoang < 20) return 1
  if (riskpoang < 40) return 2
  if (riskpoang < 60) return 3
  if (riskpoang < 80) return 4
  return 5
}

function extractKategori(namn: string): string {
  const kategorier = [
    { keywords: ['restaurang', 'servering', 'café'], kategori: 'Restaurang' },
    { keywords: ['bageri', 'konditori', 'bakv'], kategori: 'Bageri/Konditori' },
    { keywords: ['butik', 'försäljning'], kategori: 'Butik' },
    { keywords: ['catering', 'leverans'], kategori: 'Catering' },
    { keywords: ['slakteri', 'kött', 'chark'], kategori: 'Köttproduktion' },
    { keywords: ['fisk'], kategori: 'Fiskberedning' },
    { keywords: ['mejeri', 'ost', 'mjölk'], kategori: 'Mejeri' },
  ]

  const lowerNamn = namn.toLowerCase()
  for (const { keywords, kategori } of kategorier) {
    if (keywords.some(kw => lowerNamn.includes(kw))) {
      return kategori
    }
  }

  return 'Övrigt'
}
