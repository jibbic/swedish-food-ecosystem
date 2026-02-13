import { getNeo4jDriver } from '../neo4j/client'
import { fetchUppgiftskrav } from '../parsers/uppgiftskrav'
import { fetchVerksamhetstyper } from '../parsers/livsmedelsverket'

async function setupConstraints() {
  const driver = getNeo4jDriver()
  const session = driver.session()

  console.log('🔧 Creating constraints and indexes...')

  try {
    // Constraints for uniqueness
    await session.run(`
      CREATE CONSTRAINT verksamhetstyp_id IF NOT EXISTS
      FOR (v:Verksamhetstyp) REQUIRE v.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT uppgiftskrav_id IF NOT EXISTS
      FOR (k:Uppgiftskrav) REQUIRE k.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT myndighet_id IF NOT EXISTS
      FOR (m:Myndighet) REQUIRE m.id IS UNIQUE
    `)

    // Indexes for performance
    await session.run(`
      CREATE INDEX verksamhetstyp_riskklass IF NOT EXISTS
      FOR (v:Verksamhetstyp) ON (v.riskKlass)
    `)

    await session.run(`
      CREATE INDEX verksamhetstyp_kategori IF NOT EXISTS
      FOR (v:Verksamhetstyp) ON (v.kategori)
    `)

    console.log('✅ Constraints and indexes created')
  } catch (error) {
    console.error('Error creating constraints:', error)
  } finally {
    await session.close()
  }
}

async function clearDatabase() {
  const driver = getNeo4jDriver()
  const session = driver.session()

  console.log('🧹 Clearing existing data...')

  try {
    await session.run('MATCH (n) DETACH DELETE n')
    console.log('✅ Database cleared')
  } finally {
    await session.close()
  }
}

async function seedVerksamhetstyper() {
  const driver = getNeo4jDriver()
  const session = driver.session()

  console.log('🌱 Seeding verksamhetstyper...')

  try {
    const verksamheter = await fetchVerksamhetstyper()

    for (const v of verksamheter) {
      await session.run(
        `
        CREATE (v:Verksamhetstyp {
          id: $id,
          kod: $kod,
          namn: $namn,
          beskrivning: $beskrivning,
          riskKlass: $riskKlass,
          kräverGodkännande: $kräverGodkännande,
          kräverRegistrering: $kräverRegistrering,
          kategori: $kategori,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        `,
        v
      )
    }

    console.log(`✅ Created ${verksamheter.length} Verksamhetstyp nodes`)
    return verksamheter
  } finally {
    await session.close()
  }
}

async function seedUppgiftskravOchMyndigheter() {
  const driver = getNeo4jDriver()
  const session = driver.session()

  console.log('🌱 Seeding uppgiftskrav och myndigheter...')

  try {
    const { uppgiftskrav, myndigheter } = await fetchUppgiftskrav()

    // Create myndigheter first
    for (const m of myndigheter) {
      await session.run(
        `
        CREATE (m:Myndighet {
          id: $id,
          namn: $namn,
          kortnamn: $kortnamn,
          typ: $typ,
          sektor: $sektor,
          ansvar: $ansvar,
          kontakt: $kontakt,
          createdAt: $createdAt
        })
        `,
        {
          ...m,
          sektor: m.sektor,
          kontakt: JSON.stringify(m.kontakt),
        }
      )
    }

    console.log(`✅ Created ${myndigheter.length} Myndighet nodes`)

    // Create uppgiftskrav
    for (const k of uppgiftskrav) {
      await session.run(
        `
        CREATE (k:Uppgiftskrav {
          id: $id,
          namn: $namn,
          beskrivning: $beskrivning,
          lagrum: $lagrum,
          verksamhetsområde: $verksamhetsområde,
          myndighetNamn: $myndighetNamn,
          deadline: $deadline,
          återkommande: $återkommande,
          url: $url,
          status: $status,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        `,
        {
          ...k,
          verksamhetsområde: k.verksamhetsområde,
          deadline: k.deadline ?? null,
          url: k.url ?? null,
        }
      )
    }

    console.log(`✅ Created ${uppgiftskrav.length} Uppgiftskrav nodes`)
    return { uppgiftskrav, myndigheter }
  } finally {
    await session.close()
  }
}

async function createRelationships() {
  const driver = getNeo4jDriver()
  const session = driver.session()

  console.log('🔗 Creating relationships...')

  try {
    // Connect verksamhetstyper to uppgiftskrav
    // All verksamhetstyper måste uppfylla grundläggande krav
    const result1 = await session.run(`
      MATCH (v:Verksamhetstyp), (k:Uppgiftskrav)
      WHERE k.namn CONTAINS 'Registrering' OR k.namn CONTAINS 'registrering'
      CREATE (v)-[:MÅSTE_UPPFYLLA {obligatorisk: true, prioritet: 1}]->(k)
      RETURN count(*) as count
    `)

    console.log(`✅ Created ${result1.records[0]?.get('count').toNumber() || 0} MÅSTE_UPPFYLLA relationships`)

    // Connect uppgiftskrav to their specific responsible myndighet
    // Match on myndighet name (stored in uppgiftskrav.myndighetNamn)
    const result2 = await session.run(`
      MATCH (k:Uppgiftskrav), (m:Myndighet)
      WHERE k.myndighetNamn = m.namn
      CREATE (k)-[:STÄLLS_AV {kontrollfrekvens: 'Vid ansökan'}]->(m)
      RETURN count(*) as count
    `)

    console.log(`✅ Created ${result2.records[0]?.get('count').toNumber() || 0} STÄLLS_AV relationships`)
  } finally {
    await session.close()
  }
}

export async function seedDatabase() {
  const startTime = Date.now()

  console.log('🌱 Starting database seeding...\n')

  try {
    await setupConstraints()
    await clearDatabase()
    await seedVerksamhetstyper()
    await seedUppgiftskravOchMyndigheter()
    await createRelationships()

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n🎉 Seeding completed successfully in ${duration}s`)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ All done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error)
      process.exit(1)
    })
}
