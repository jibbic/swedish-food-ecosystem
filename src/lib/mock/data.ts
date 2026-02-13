import type { GraphData, Verksamhetstyp, Myndighet } from '@/types/neo4j'

/**
 * Mock data for testing frontend without Neo4j database
 * Use this when Docker/Neo4j is not available
 */

export const mockVerksamhetstyper: Verksamhetstyp[] = [
  {
    id: 'v1',
    kod: 'LIV-001',
    namn: 'Restaurang med tillagning',
    beskrivning: 'Restaurang som tillagar och serverar mat till gäster',
    kategori: 'Restaurang',
    riskKlass: 3,
    riskpoang: 25,
  },
  {
    id: 'v2',
    kod: 'LIV-002',
    namn: 'Bageri med försäljning',
    beskrivning: 'Bageri som bakar och säljer bröd och bakverk',
    kategori: 'Bageri/Konditori',
    riskKlass: 2,
    riskpoang: 15,
  },
  {
    id: 'v3',
    kod: 'LIV-003',
    namn: 'Livsmedelsbutik',
    beskrivning: 'Butik som säljer livsmedel till konsumenter',
    kategori: 'Butik',
    riskKlass: 2,
    riskpoang: 12,
  },
  {
    id: 'v4',
    kod: 'LIV-004',
    namn: 'Slakteri',
    beskrivning: 'Anläggning för slakt och styckning av djur',
    kategori: 'Köttproduktion',
    riskKlass: 5,
    riskpoang: 45,
  },
  {
    id: 'v5',
    kod: 'LIV-005',
    namn: 'Gatukök',
    beskrivning: 'Mobil enhet för försäljning av varm mat',
    kategori: 'Restaurang',
    riskKlass: 3,
    riskpoang: 22,
  },
]

export const mockMyndigheter: Myndighet[] = [
  {
    id: 'm1',
    namn: 'Livsmedelsverket',
    beskrivning: 'Ansvarig för livsmedelssäkerhet och nutrition',
    typ: 'Statlig',
    sektor: 'Livsmedel',
    ansvar: 'Livsmedelssäkerhet, märkning, kontroll',
    kontakt: JSON.stringify({
      url: 'https://www.livsmedelsverket.se',
      email: 'livsmedelsverket@slv.se',
      telefon: '018-17 55 00',
    }),
  },
  {
    id: 'm2',
    namn: 'Skatteverket',
    beskrivning: 'Ansvarig för skatter och moms',
    typ: 'Statlig',
    sektor: 'Finans',
    ansvar: 'Moms, arbetsgivaravgifter, kontrolluppgifter',
    kontakt: JSON.stringify({
      url: 'https://www.skatteverket.se',
      email: 'huvudkontoret@skatteverket.se',
      telefon: '0771-567 567',
    }),
  },
  {
    id: 'm3',
    namn: 'Bolagsverket',
    beskrivning: 'Registrering av företag',
    typ: 'Statlig',
    sektor: 'Näringsliv',
    ansvar: 'Företagsregistrering, årsbokslut',
    kontakt: JSON.stringify({
      url: 'https://www.bolagsverket.se',
      email: 'bolagsverket@bolagsverket.se',
      telefon: '0771-670 670',
    }),
  },
  {
    id: 'm4',
    namn: 'Miljö- och hälsoskyddsnämnden',
    beskrivning: 'Lokal tillsyn av livsmedelsverksamhet',
    typ: 'Kommunal',
    sektor: 'Miljö & Hälsa',
    ansvar: 'Livsmedelskontroll, anmälan, tillsyn',
    kontakt: JSON.stringify({
      url: 'https://www.stockholm.se',
      email: 'miljohalsa@stockholm.se',
      telefon: '08-508 29 000',
    }),
  },
]

export const mockGraphData: GraphData = {
  nodes: [
    // Verksamhetstyper
    ...mockVerksamhetstyper.map(v => ({
      id: v.id,
      type: 'Verksamhetstyp' as const,
      label: v.namn,
      properties: {
        kod: v.kod,
        kategori: v.kategori,
        riskKlass: v.riskKlass,
        riskpoang: v.riskpoang,
        beskrivning: v.beskrivning,
      },
    })),
    // Myndigheter
    ...mockMyndigheter.map(m => ({
      id: m.id,
      type: 'Myndighet' as const,
      label: m.namn,
      properties: {
        typ: m.typ,
        sektor: m.sektor,
        ansvar: m.ansvar,
        kontakt: m.kontakt,
      },
    })),
    // Uppgiftskrav
    {
      id: 'k1',
      type: 'Uppgiftskrav' as const,
      label: 'Registrering av livsmedelsverksamhet',
      properties: {
        beskrivning: 'Alla livsmedelsföretag måste registrera sin verksamhet',
        kategori: 'Registrering',
        lagrum: 'Livsmedelslagen 2006:804',
      },
    },
    {
      id: 'k2',
      type: 'Uppgiftskrav' as const,
      label: 'Momsregistrering',
      properties: {
        beskrivning: 'Företag med omsättning över 30 000 kr måste momsregistrera sig',
        kategori: 'Skatt',
        lagrum: 'Mervärdesskattelagen 1994:200',
      },
    },
    {
      id: 'k3',
      type: 'Uppgiftskrav' as const,
      label: 'HACCP-plan',
      properties: {
        beskrivning: 'Systematisk riskanalys av livsmedelssäkerhet',
        kategori: 'Livsmedelssäkerhet',
        lagrum: 'EU 852/2004',
      },
    },
    {
      id: 'k4',
      type: 'Uppgiftskrav' as const,
      label: 'Egenkontrollprogram',
      properties: {
        beskrivning: 'Dokumenterat system för att säkerställa livsmedelssäkerhet',
        kategori: 'Livsmedelssäkerhet',
        lagrum: 'LIVSFS 2005:20',
      },
    },
  ],
  edges: [
    // Verksamhetstyper måste uppfylla krav
    { source: 'v1', target: 'k1', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v1', target: 'k2', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v1', target: 'k3', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v1', target: 'k4', type: 'MÅSTE_UPPFYLLA' },
    
    { source: 'v2', target: 'k1', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v2', target: 'k2', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v2', target: 'k3', type: 'MÅSTE_UPPFYLLA' },
    
    { source: 'v3', target: 'k1', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v3', target: 'k2', type: 'MÅSTE_UPPFYLLA' },
    
    { source: 'v4', target: 'k1', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v4', target: 'k2', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v4', target: 'k3', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v4', target: 'k4', type: 'MÅSTE_UPPFYLLA' },
    
    { source: 'v5', target: 'k1', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v5', target: 'k2', type: 'MÅSTE_UPPFYLLA' },
    { source: 'v5', target: 'k3', type: 'MÅSTE_UPPFYLLA' },

    // Krav ställs av myndigheter
    { source: 'k1', target: 'm1', type: 'STÄLLS_AV' },
    { source: 'k2', target: 'm2', type: 'STÄLLS_AV' },
    { source: 'k3', target: 'm1', type: 'STÄLLS_AV' },
    { source: 'k4', target: 'm1', type: 'STÄLLS_AV' },
  ],
}

// Helper function to get mock data with filters
export function getMockGraphData(filters?: {
  kategori?: string
  riskKlass?: number
}): GraphData {
  if (!filters || (!filters.kategori && !filters.riskKlass)) {
    return mockGraphData
  }

  // Filter nodes
  const filteredVerksamhetIds = new Set(
    mockVerksamhetstyper
      .filter(v => {
        if (filters.kategori && v.kategori !== filters.kategori) return false
        if (filters.riskKlass && v.riskKlass < filters.riskKlass) return false
        return true
      })
      .map(v => v.id)
  )

  // Include relevant nodes and edges
  const relevantNodeIds = new Set<string>(filteredVerksamhetIds)
  
  // Add connected krav and myndigheter
  mockGraphData.edges.forEach(edge => {
    if (filteredVerksamhetIds.has(edge.source)) {
      relevantNodeIds.add(edge.source)
      relevantNodeIds.add(edge.target)
    }
  })

  return {
    nodes: mockGraphData.nodes.filter(n => relevantNodeIds.has(n.id)),
    edges: mockGraphData.edges.filter(e => 
      relevantNodeIds.has(e.source) && relevantNodeIds.has(e.target)
    ),
  }
}
