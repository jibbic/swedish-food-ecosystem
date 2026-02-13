// TypeScript types for Neo4j nodes and relationships

export interface Verksamhetstyp {
  id: string
  kod: string
  namn: string
  beskrivning: string
  riskKlass: 1 | 2 | 3 | 4 | 5
  kräverGodkännande: boolean
  kräverRegistrering: boolean
  kategori: string
  createdAt: string
  updatedAt: string
}

export interface Uppgiftskrav {
  id: string
  namn: string
  beskrivning: string
  lagrum: string
  verksamhetsområde: string[]
  deadline?: string
  återkommande: boolean
  url: string
  status: 'Aktiv' | 'Utgången'
  createdAt: string
  updatedAt: string
}

export interface Myndighet {
  id: string
  namn: string
  kortnamn: string
  typ: 'Statlig' | 'Regional' | 'Kommunal'
  sektor: string[]
  ansvar: string
  kontakt: {
    telefon?: string
    email?: string
    url: string
  }
  createdAt: string
}

export interface Register {
  id: string
  namn: string
  beskrivning: string
  syfte: string
  ägare: string
  tillgång: 'Offentlig' | 'Begränsad' | 'Intern'
  apiUrl?: string
  createdAt: string
}

export interface Lag {
  id: string
  namn: string
  typ: 'Lag' | 'Förordning' | 'EU-förordning'
  paragraf?: string
  url: string
  ikraftträdande: string
}

// Relationship types
export interface MåsteUppfyllaRelation {
  obligatorisk: boolean
  villkorligt?: string
  prioritet: 1 | 2 | 3
}

export interface StällsAvRelation {
  ansvarig_enhet?: string
  kontrollfrekvens?: string
}

// Graph response types
export interface GraphNode {
  id: string
  label: string
  type: 'Verksamhetstyp' | 'Uppgiftskrav' | 'Myndighet' | 'Register' | 'Lag'
  properties: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  type: string
  properties?: Record<string, any>
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
