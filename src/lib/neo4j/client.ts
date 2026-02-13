import neo4j, { Driver, Session } from 'neo4j-driver'

let driver: Driver | null = null

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687'
    const user = process.env.NEO4J_USER || 'neo4j'
    const password = process.env.NEO4J_PASSWORD || 'foodsystem2026'

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 30000,
    })
  }

  return driver
}

export async function getSession(): Promise<Session> {
  const driver = getNeo4jDriver()
  return driver.session()
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close()
    driver = null
  }
}

// Health check
export async function testConnection(): Promise<boolean> {
  const session = await getSession()
  try {
    await session.run('RETURN 1')
    return true
  } catch (error) {
    console.error('Neo4j connection failed:', error)
    return false
  } finally {
    await session.close()
  }
}
