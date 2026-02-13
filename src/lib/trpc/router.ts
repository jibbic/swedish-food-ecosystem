import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import * as queries from '@/lib/neo4j/queries'

const t = initTRPC.create()

export const appRouter = t.router({
  // Verksamhetstyper
  verksamheter: t.router({
    list: t.procedure.query(async () => {
      return await queries.getAllVerksamhetstyper()
    }),

    byId: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await queries.getVerksamhetstypById(input.id)
      }),

    uppgiftskrav: t.procedure
      .input(z.object({ verksamhetId: z.string() }))
      .query(async ({ input }) => {
        return await queries.getUppgiftskravForVerksamhet(input.verksamhetId)
      }),
  }),

  // Myndigheter
  myndigheter: t.router({
    list: t.procedure.query(async () => {
      return await queries.getAllMyndigheter()
    }),
  }),

  // Graph
  graph: t.router({
    ecosystem: t.procedure
      .input(
        z.object({
          kategori: z.string().optional(),
          riskKlass: z.number().min(1).max(5).optional(),
          myndighetId: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await queries.getEcosystemGraph(input)
      }),

    search: t.procedure
      .input(z.object({ query: z.string().min(2) }))
      .query(async ({ input }) => {
        return await queries.searchNodes(input.query)
      }),
  }),

  // Health check
  health: t.procedure.query(async () => {
    const { testConnection, getNeo4jDriver } = await import('@/lib/neo4j/client')
    try {
      const isHealthy = await testConnection()
      const driver = getNeo4jDriver()
      const serverInfo = await driver.getServerInfo()
      return { 
        status: isHealthy ? 'ok' : 'error', 
        timestamp: new Date().toISOString(),
        neo4jVersion: serverInfo.agent,
        address: serverInfo.address,
      }
    } catch (error) {
      return { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Kontrollera att Neo4j är igång och att lösenordet är korrekt'
      }
    }
  }),

  // Debug: Get database overview
  debug: t.router({
    overview: t.procedure.query(async () => {
      const { getSession } = await import('@/lib/neo4j/client')
      
      try {
        const session = await getSession()
        
        try {
          // Count all node types
          const countResult = await session.run(`
            MATCH (n)
            RETURN labels(n)[0] as label, count(*) as count
            ORDER BY count DESC
          `)
          
          const nodeCounts = countResult.records.map(record => ({
            label: record.get('label') as string,
            count: record.get('count').toNumber(),
          }))

          // Get total counts
          const totalResult = await session.run(`
            MATCH (n) RETURN count(n) as totalNodes
          `)
          const totalNodes = totalResult.records[0]?.get('totalNodes').toNumber() || 0

          const relResult = await session.run(`
            MATCH ()-[r]->() RETURN count(r) as totalRels
          `)
          const totalRels = relResult.records[0]?.get('totalRels').toNumber() || 0

          // Sample data from each type
          const samples: Record<string, unknown[]> = {}
          for (const { label } of nodeCounts.slice(0, 5)) {
            const sampleResult = await session.run(`
              MATCH (n:${label})
              RETURN n
              LIMIT 5
            `)
            samples[label] = sampleResult.records.map(r => r.get('n').properties)
          }

          return {
            success: true,
            totalNodes,
            totalRels,
            nodeCounts,
            samples,
          }
        } finally {
          await session.close()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          env: {
            NEO4J_URI: process.env.NEO4J_URI || 'NOT SET',
            NEO4J_USER: process.env.NEO4J_USER || 'NOT SET',
            NEO4J_PASSWORD: process.env.NEO4J_PASSWORD ? '***SET***' : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV,
          }
        }
      }
    }),
  }),
})

export type AppRouter = typeof appRouter
