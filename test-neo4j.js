#!/usr/bin/env node

/**
 * Test Neo4j Connection
 * Run with: node test-neo4j.js
 * or: npm run test:neo4j
 */

import neo4j from 'neo4j-driver'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read .env file manually (no external deps needed)
let envVars = {}
try {
  const envPath = join(process.cwd(), '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      envVars[match[1].trim()] = match[2].trim()
    }
  })
} catch (error) {
  console.log('⚠️  No .env file found, using defaults\n')
}

const uri = process.env.NEO4J_URI || envVars.NEO4J_URI || 'bolt://localhost:7687'
const user = process.env.NEO4J_USER || envVars.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD || envVars.NEO4J_PASSWORD || 'foodsystem2026'

console.log('🔍 Testing Neo4j Connection...\n')
console.log(`URI: ${uri}`)
console.log(`User: ${user}`)
console.log(`Password: ${'*'.repeat(password.length)}\n`)

let driver

try {
  // Create driver
  console.log('📡 Creating driver...')
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 10,
    connectionTimeout: 10000,
  })

  // Test connection
  console.log('🔌 Testing connection...')
  await driver.verifyConnectivity()
  console.log('✅ Connection successful!\n')

  // Get server info
  const serverInfo = await driver.getServerInfo()
  console.log('📊 Server Info:')
  console.log(`   Version: ${serverInfo.agent}`)
  console.log(`   Address: ${serverInfo.address}\n`)

  // Run a simple query
  console.log('🔍 Running test query...')
  const session = driver.session()
  
  try {
    const result = await session.run('MATCH (n) RETURN count(n) as count')
    const count = result.records[0].get('count').toNumber()
    console.log(`✅ Query successful!`)
    console.log(`   Total nodes: ${count}\n`)

    if (count === 0) {
      console.log('⚠️  Database is empty! Run: npm run seed')
    } else {
      console.log('✅ Database has data!')
    }
  } finally {
    await session.close()
  }

  console.log('\n✅ All tests passed!')
  process.exit(0)
} catch (error) {
  console.error('\n❌ Connection failed!\n')
  
  if (error.code === 'ServiceUnavailable') {
    console.error('💡 Neo4j is not running or not reachable.')
    console.error('   Check: docker ps')
    console.error('   Start: docker compose up -d\n')
  } else if (error.code === 'Neo.ClientError.Security.Unauthorized') {
    console.error('💡 Authentication failed.')
    console.error('   Check your .env file:')
    console.error('   NEO4J_PASSWORD should match docker-compose.yml (default: foodsystem2026)\n')
  } else {
    console.error('Error details:', error.message)
    console.error('Error code:', error.code || 'N/A')
  }
  
  process.exit(1)
} finally {
  if (driver) {
    await driver.close()
  }
}
