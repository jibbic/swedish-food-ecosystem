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
    const { testConnection } = await import('@/lib/neo4j/client')
    const isHealthy = await testConnection()
    return { status: isHealthy ? 'ok' : 'error', timestamp: new Date().toISOString() }
  }),
})

export type AppRouter = typeof appRouter
