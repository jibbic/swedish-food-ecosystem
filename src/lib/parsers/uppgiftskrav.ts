import { XMLParser } from 'fast-xml-parser'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Uppgiftskrav, Myndighet } from '@/types/neo4j'

type RawUppgiftskrav = Record<string, unknown>

interface UppgiftskravXML {
  uppgiftskrav?: RawUppgiftskrav[]
  uppgiftskravRoot?: {
    uppgiftskrav?: RawUppgiftskrav[]
  }
}

interface FallbackKrav {
  id: string
  namn: string
  beskrivning: string
  lagrum: string
  verksamhetsområde: string[]
  myndighet: string
  url: string
}

const fallbackKravData: FallbackKrav[] = [
  {
    id: 'uk-fallback-1',
    namn: 'Registrering av livsmedelsverksamhet',
    beskrivning: 'Anmäl verksamheten till kommunens kontrollmyndighet innan start.',
    lagrum: 'Förordning (EG) nr 852/2004 artikel 6',
    verksamhetsområde: ['Livsmedel', 'Restaurang'],
    myndighet: 'Miljö- och hälsoskyddsnämnden',
    url: 'https://www.verksamt.se/starta/registrera-livsmedelsverksamhet',
  },
  {
    id: 'uk-fallback-2',
    namn: 'Märkning och information om allergener',
    beskrivning: 'Säkerställ korrekt märkning och allergeninformation för produkter.',
    lagrum: 'Förordning (EU) nr 1169/2011',
    verksamhetsområde: ['Livsmedel'],
    myndighet: 'Livsmedelsverket',
    url: 'https://www.livsmedelsverket.se',
  },
  {
    id: 'uk-fallback-3',
    namn: 'Egenkontroll och HACCP-rutiner',
    beskrivning: 'Inför dokumenterade rutiner för hygien, temperatur och spårbarhet.',
    lagrum: 'Förordning (EG) nr 852/2004',
    verksamhetsområde: ['Livsmedel', 'Catering'],
    myndighet: 'Livsmedelsverket',
    url: 'https://www.livsmedelsverket.se',
  },
  {
    id: 'uk-fallback-4',
    namn: 'Momsregistrering för företag',
    beskrivning: 'Registrera företaget för moms och lämna momsdeklaration enligt reglerna.',
    lagrum: 'Mervärdesskattelagen (1994:200)',
    verksamhetsområde: ['Företagande', 'Livsmedel'],
    myndighet: 'Skatteverket',
    url: 'https://www.skatteverket.se',
  },
]

export async function fetchUppgiftskrav(): Promise<{ uppgiftskrav: Uppgiftskrav[]; myndigheter: Myndighet[] }> {
  const url = process.env.UPPGIFTSKRAV_XML_URL || 'https://www.uppgiftskrav.se/uppgiftskrav/files/uppgiftskrav.xml'
  const localXmlPath = process.env.UPPGIFTSKRAV_XML_FILE || path.join(process.cwd(), 'data', 'external', 'uppgiftskrav.xml')

  try {
    await access(localXmlPath)
    console.log('📂 Loading uppgiftskrav from local file', localXmlPath)
    const xmlData = await readFile(localXmlPath, 'utf8')
    return transformXmlToDomain(xmlData)
  } catch {
    // no-op, continue with network fetch
  }
  
  console.log('📥 Fetching uppgiftskrav från', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Swedish-Food-Ecosystem/0.1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlData = await response.text()
    return transformXmlToDomain(xmlData)
  } catch (error) {
    console.error('❌ Error fetching uppgiftskrav:', error)
    console.warn('⚠️ Falling back to built-in uppgiftskrav data for local development')
    return getFallbackUppgiftskravData()
  }
}

function transformXmlToDomain(xmlData: string): { uppgiftskrav: Uppgiftskrav[]; myndigheter: Myndighet[] } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const parsed = parser.parse(xmlData) as UppgiftskravXML
  const rawItems = parsed.uppgiftskravRoot?.uppgiftskrav || parsed.uppgiftskrav || []
  const rawArray = Array.isArray(rawItems) ? rawItems : [rawItems]
  const includeAll = process.env.UPPGIFTSKRAV_INCLUDE_ALL === 'true' || process.env.DEMO_INCLUDE_ALL_DATA === 'true'

  const normalized = rawArray
    .map((item, index) => normalizeUppgiftskrav(item, index))
    .filter(item => item !== null)

  const filtered = includeAll ? normalized : normalized.filter(item => isFoodRelated(item))

  const now = new Date().toISOString()
  const myndighetMap = new Map<string, Myndighet>()

  filtered.forEach(item => {
    if (!myndighetMap.has(item.myndighetNamn)) {
      myndighetMap.set(item.myndighetNamn, {
        id: `myn-${item.myndighetNamn.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        namn: item.myndighetNamn,
        kortnamn: extractKortnamn(item.myndighetNamn),
        typ: item.myndighetNamn.includes('nämnden') ? 'Kommunal' : 'Statlig',
        sektor: ['Livsmedel'],
        ansvar: `Ansvarar för ${item.namn.toLowerCase()}`,
        kontakt: {
          url: item.url || `https://www.google.com/search?q=${encodeURIComponent(item.myndighetNamn)}`,
        },
        createdAt: now,
      })
    }
  })

  const uppgiftskrav: Uppgiftskrav[] = filtered.map(item => ({
    id: item.id,
    namn: item.namn,
    beskrivning: item.beskrivning,
    lagrum: item.lagrum,
    verksamhetsområde: item.verksamhetsområde,
    myndighetNamn: item.myndighetNamn, // Spara myndighetnamn!
    deadline: undefined,
    återkommande: false,
    url: item.url,
    status: 'Aktiv',
    createdAt: now,
    updatedAt: now,
  }))

  console.log(`✅ Parsed ${uppgiftskrav.length} uppgiftskrav och ${myndighetMap.size} myndigheter`)

  return {
    uppgiftskrav,
    myndigheter: Array.from(myndighetMap.values()),
  }
}

function normalizeUppgiftskrav(item: RawUppgiftskrav, index: number): {
  id: string
  namn: string
  beskrivning: string
  lagrum: string
  verksamhetsområde: string[]
  myndighetNamn: string
  url: string
} | null {
  const namn = getString(item.uppgiftskrav) || getString(item.namn)
  if (!namn) return null

  const kravomrade = asArray<Record<string, unknown>>(item.kravomrade)
  const verksamhetsområde = asArray<string>(item.verksamhetsomrade)
  const verksamhetsområden = [
    ...verksamhetsområde,
    ...kravomrade.map(k => getString(k.namn)).filter((value): value is string => Boolean(value)),
  ]

  const links = asArray<Record<string, unknown>>((item.lankar as Record<string, unknown> | undefined)?.lank)
  const forfattningLink = links.find(link => getString(link.typ) === 'FORFATTNING')
  const firstLink = links[0]

  const myndighetNamn =
    getString(item.ansvarigMyndighet) ||
    getString(item.insamlandeMyndighet) ||
    getString(kravomrade[0]?.myndighet) ||
    getString((item.myndighet as Record<string, unknown> | undefined)?.namn) ||
    'Okänd myndighet'

  return {
    id: getString(item.kravid) || getString(item.id) || `uk-${index + 1}`,
    namn,
    beskrivning: stripHtml(getString(item.kortBeskrivning) || getString(item.beskrivning) || namn),
    lagrum: getString((forfattningLink as Record<string, unknown> | undefined)?.alternativText) || getString(item.lagrum) || 'N/A',
    verksamhetsområde: verksamhetsområden.length > 0 ? verksamhetsområden : ['Okänt område'],
    myndighetNamn,
    url: getString((firstLink as Record<string, unknown> | undefined)?.url) || getString(item.url) || '',
  }
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value === undefined || value === null || value === '') return []
  return [value as T]
}

function getString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isFoodRelated(item: { namn: string; beskrivning: string; verksamhetsområde: string[]; myndighetNamn: string }): boolean {
  const haystack = [item.namn, item.beskrivning, item.myndighetNamn, ...item.verksamhetsområde].join(' ').toLowerCase()
  return ['livsmedel', 'restaurang', 'mat', 'dryck', 'kök', 'catering', 'servering'].some(keyword => haystack.includes(keyword))
}

function getFallbackUppgiftskravData(): { uppgiftskrav: Uppgiftskrav[]; myndigheter: Myndighet[] } {
  const now = new Date().toISOString()
  const myndighetMap = new Map<string, Myndighet>()

  fallbackKravData.forEach(krav => {
    if (!myndighetMap.has(krav.myndighet)) {
      myndighetMap.set(krav.myndighet, {
        id: `myn-${krav.myndighet.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        namn: krav.myndighet,
        kortnamn: extractKortnamn(krav.myndighet),
        typ: krav.myndighet.includes('nämnden') ? 'Kommunal' : 'Statlig',
        sektor: ['Livsmedel'],
        ansvar: `Ansvarar för krav inom ${krav.verksamhetsområde.join(', ')}`,
        kontakt: { url: krav.url },
        createdAt: now,
      })
    }
  })

  const uppgiftskrav: Uppgiftskrav[] = fallbackKravData.map(krav => ({
    id: krav.id,
    namn: krav.namn,
    beskrivning: krav.beskrivning,
    lagrum: krav.lagrum,
    verksamhetsområde: krav.verksamhetsområde,
    deadline: undefined,
    återkommande: false,
    url: krav.url,
    status: 'Aktiv',
    createdAt: now,
    updatedAt: now,
  }))

  console.log(`✅ Loaded ${uppgiftskrav.length} fallback uppgiftskrav och ${myndighetMap.size} myndigheter`)

  return {
    uppgiftskrav,
    myndigheter: Array.from(myndighetMap.values()),
  }
}

function extractKortnamn(namn: string): string {
  const mapping: Record<string, string> = {
    'Livsmedelsverket': 'LV',
    'Skatteverket': 'SKV',
    'Bolagsverket': 'BV',
    'Tillväxtverket': 'TV',
    'Arbetsmiljöverket': 'AV',
    'Försäkringskassan': 'FK',
  }

  for (const [full, short] of Object.entries(mapping)) {
    if (namn.includes(full)) return short
  }

  // Fallback: Första bokstäverna
  return namn
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join('')
    .slice(0, 3)
}
