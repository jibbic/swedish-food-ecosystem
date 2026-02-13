import { getSession } from './client'
import type { Verksamhetstyp, Uppgiftskrav, Myndighet, GraphData } from '@/types/neo4j'

// Get all verksamhetstyper
export async function getAllVerksamhetstyper(): Promise<Verksamhetstyp[]> {
  const session = await getSession()
  try {
    const result = await session.run(`
      MATCH (v:Verksamhetstyp)
      RETURN v
      ORDER BY v.kod
    `)
    
    return result.records.map(record => record.get('v').properties as Verksamhetstyp)
  } finally {
    await session.close()
  }
}

// Get verksamhetstyp by ID
export async function getVerksamhetstypById(id: string): Promise<Verksamhetstyp | null> {
  const session = await getSession()
  try {
    const result = await session.run(`
      MATCH (v:Verksamhetstyp {id: $id})
      RETURN v
    `, { id })
    
    if (result.records.length === 0) return null
    return result.records[0].get('v').properties as Verksamhetstyp
  } finally {
    await session.close()
  }
}

// Get uppgiftskrav for verksamhetstyp
export async function getUppgiftskravForVerksamhet(verksamhetId: string): Promise<Uppgiftskrav[]> {
  const session = await getSession()
  try {
    const result = await session.run(`
      MATCH (v:Verksamhetstyp {id: $verksamhetId})-[:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)
      RETURN k
      ORDER BY k.prioritet, k.namn
    `, { verksamhetId })
    
    return result.records.map(record => record.get('k').properties as Uppgiftskrav)
  } finally {
    await session.close()
  }
}

// Get all myndigheter
export async function getAllMyndigheter(): Promise<Myndighet[]> {
  const session = await getSession()
  try {
    const result = await session.run(`
      MATCH (m:Myndighet)
      RETURN m
      ORDER BY m.namn
    `)
    
    return result.records.map(record => record.get('m').properties as Myndighet)
  } finally {
    await session.close()
  }
}

// Get ecosystem graph data
export async function getEcosystemGraph(filters?: {
  kategori?: string
  riskKlass?: number
  myndighetId?: string
}): Promise<GraphData> {
  const session = await getSession()
  try {
    let whereClause = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {}

    if (filters?.kategori) {
      whereClause += ' AND v.kategori = $kategori'
      params.kategori = filters.kategori
    }
    if (filters?.riskKlass) {
      whereClause += ' AND v.riskKlass >= $riskKlass'
      params.riskKlass = filters.riskKlass
    }

    const query = `
      MATCH (v:Verksamhetstyp)-[r:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)-[:STÄLLS_AV]->(m:Myndighet)
      WHERE 1=1 ${whereClause}
      RETURN v, r, k, m
      LIMIT 200
    `

    const result = await session.run(query, params)
    
    const nodes: GraphData['nodes'] = []
    const edges: GraphData['edges'] = []
    const seenNodes = new Set<string>()

    result.records.forEach(record => {
      const v = record.get('v')
      const k = record.get('k')
      const m = record.get('m')

      // Add nodes
      if (!seenNodes.has(v.properties.id)) {
        nodes.push({
          id: v.properties.id,
          label: v.properties.namn,
          type: 'Verksamhetstyp',
          properties: v.properties,
        })
        seenNodes.add(v.properties.id)
      }

      if (!seenNodes.has(k.properties.id)) {
        nodes.push({
          id: k.properties.id,
          label: k.properties.namn,
          type: 'Uppgiftskrav',
          properties: k.properties,
        })
        seenNodes.add(k.properties.id)
      }

      if (!seenNodes.has(m.properties.id)) {
        nodes.push({
          id: m.properties.id,
          label: m.properties.namn,
          type: 'Myndighet',
          properties: m.properties,
        })
        seenNodes.add(m.properties.id)
      }

      // Add edges
      edges.push({
        source: v.properties.id,
        target: k.properties.id,
        type: 'MÅSTE_UPPFYLLA',
      })

      edges.push({
        source: k.properties.id,
        target: m.properties.id,
        type: 'STÄLLS_AV',
      })
    })

    return { nodes, edges }
  } finally {
    await session.close()
  }
}

// Search nodes
export async function searchNodes(query: string): Promise<GraphData['nodes']> {
  const session = await getSession()
  try {
    const result = await session.run(`
      CALL db.index.fulltext.queryNodes("search_index", $query)
      YIELD node, score
      RETURN node, labels(node) as labels
      ORDER BY score DESC
      LIMIT 20
    `, { query: `${query}*` })
    
    return result.records.map(record => {
      const node = record.get('node')
      const labels = record.get('labels')
      return {
        id: node.properties.id,
        label: node.properties.namn || node.properties.namn,
        type: labels[0],
        properties: node.properties,
      }
    })
  } catch {
    // Fulltext index might not exist yet, fallback to simple match
    const result = await session.run(`
      MATCH (n)
      WHERE n.namn CONTAINS $query OR n.beskrivning CONTAINS $query
      RETURN n, labels(n) as labels
      LIMIT 20
    `, { query })
    
    return result.records.map(record => {
      const node = record.get('n')
      const labels = record.get('labels')
      return {
        id: node.properties.id,
        label: node.properties.namn,
        type: labels[0],
        properties: node.properties,
      }
    })
  } finally {
    await session.close()
  }
}
