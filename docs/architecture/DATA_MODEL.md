# Data Model

**Version**: 0.1.0  
**Last Updated**: 2026-02-12

## Overview

Swedish Food Ecosystem använder en hybrid datamodell:
- **Neo4j** för knowledge graph (entiteter och relationer)
- **PostgreSQL** för strukturerad, auditerad data (future)

Detta dokument beskriver Neo4j-grafen som är systemets hjärta.

---

## Neo4j Graph Schema

### Node Types (Labels)

#### `:Verksamhetstyp`

Representerar olika typer av livsmedelsverksamheter från Livsmedelsverkets API.

**Properties:**
```typescript
interface Verksamhetstyp {
  id: string                    // Unique identifier
  kod: string                   // LV kod (ex: "01.01")
  namn: string                  // "Restaurang med varm matlagning"
  beskrivning: string           // Detaljerad beskrivning
  riskKlass: 1 | 2 | 3 | 4 | 5 // Risknivå (1=lägst, 5=högst)
  kräverGodkännande: boolean    // Godkännande vs registrering
  kräverRegistrering: boolean
  kategori: string              // "Restaurang", "Butik", "Produktion"
  createdAt: string             // ISO timestamp
  updatedAt: string
}
```

**Example:**
```cypher
(:Verksamhetstyp {
  id: "vt-001",
  kod: "01.01",
  namn: "Restaurang med varm matlagning",
  beskrivning: "Servering av varm mat på plats",
  riskKlass: 3,
  kräverGodkännande: false,
  kräverRegistrering: true,
  kategori: "Restaurang"
})
```

---

#### `:Uppgiftskrav`

Krav från Uppgiftskrav.se som företag måste uppfylla.

**Properties:**
```typescript
interface Uppgiftskrav {
  id: string                    // Unique från Uppgiftskrav.se
  namn: string                  // "Registrering av livsmedelsanläggning"
  beskrivning: string           // Full beskrivning
  lagrum: string                // Ex: "Livsmedelslagen 2006:804"
  verksamhetsområde: string[]   // ["Livsmedel", "Mat"]
  deadline?: string             // "Före verksamhetsstart"
  återkommande: boolean         // Engångskrav eller återkommande
  url: string                   // Länk till mer info
  status: "Aktiv" | "Utgången"
  createdAt: string
  updatedAt: string
}
```

**Example:**
```cypher
(:Uppgiftskrav {
  id: "uk-001",
  namn: "Registrering av livsmedelsanläggning",
  beskrivning: "Alla som hanterar livsmedel...",
  lagrum: "EU 852/2004, Livsmedelslagen",
  deadline: "Före verksamhetsstart",
  återkommande: false,
  url: "https://livsmedelsverket.se/...",
  status: "Aktiv"
})
```

---

#### `:Myndighet`

Sveriges myndigheter som ställer krav eller kontrollerar.

**Properties:**
```typescript
interface Myndighet {
  id: string                    // Unique
  namn: string                  // "Livsmedelsverket"
  kortnamn: string              // "LV"
  typ: "Statlig" | "Regional" | "Kommunal"
  sektor: string[]              // ["Livsmedel", "Hälsa"]
  ansvar: string                // Kort beskrivning
  kontakt: {
    telefon?: string
    email?: string
    url: string
  }
  createdAt: string
}
```

**Example:**
```cypher
(:Myndighet {
  id: "myn-001",
  namn: "Livsmedelsverket",
  kortnamn: "LV",
  typ: "Statlig",
  sektor: ["Livsmedel", "Folkhälsa"],
  ansvar: "Livsmedelssäkerhet och kontroll",
  kontakt: {
    telefon: "018-17 55 00",
    url: "https://livsmedelsverket.se"
  }
})
```

---

#### `:Register`

Offentliga register som myndigheter äger och företag rapporterar till.

**Properties:**
```typescript
interface Register {
  id: string
  namn: string                  // "Livsmedelsanläggningsregistret"
  beskrivning: string
  syfte: string
  ägare: string                 // Myndighets-ID
  tillgång: "Offentlig" | "Begränsad" | "Intern"
  apiUrl?: string
  createdAt: string
}
```

---

#### `:Lag`

Juridiska dokument som stödjer uppgiftskrav.

**Properties:**
```typescript
interface Lag {
  id: string
  namn: string                  // "Livsmedelslagen (2006:804)"
  typ: "Lag" | "Förordning" | "EU-förordning"
  paragraf?: string             // "§ 3"
  url: string                   // Riksdagen.se länk
  ikraftträdande: string        // ISO date
}
```

---

#### `:Datatyp`

Typer av data som krävs (future expansion).

**Properties:**
```typescript
interface Datatyp {
  id: string
  namn: string                  // "Personnummer", "Omsättning"
  format: string                // "YYYYMMDD-XXXX"
  känslighetsnivå: 1 | 2 | 3 | 4  // GDPR-relevans
  exempel?: string
}
```

---

## Relationships (Edges)

### `:MÅSTE_UPPFYLLA`

**Pattern:** `(Verksamhetstyp)-[:MÅSTE_UPPFYLLA]->(Uppgiftskrav)`

**Properties:**
```typescript
{
  obligatorisk: boolean         // true om alltid krävs
  villkorligt?: string          // "Om omsättning > 1M SEK"
  prioritet: 1 | 2 | 3          // 1=kritisk, 3=lägre
}
```

**Example:**
```cypher
(:Verksamhetstyp {namn: "Restaurang"})
  -[:MÅSTE_UPPFYLLA {obligatorisk: true, prioritet: 1}]->
(:Uppgiftskrav {namn: "Registrering"})
```

---

### `:STÄLLS_AV`

**Pattern:** `(Uppgiftskrav)-[:STÄLLS_AV]->(Myndighet)`

**Properties:**
```typescript
{
  ansvarig_enhet?: string       // "Kontrollavdelningen"
  kontrollfrekvens?: string     // "Årligen", "Vid ansökan"
}
```

---

### `:BASERAS_PÅ`

**Pattern:** `(Uppgiftskrav)-[:BASERAS_PÅ]->(Lag)`

**Properties:**
```typescript
{
  specifik_paragraf?: string
}
```

---

### `:ÄGER`

**Pattern:** `(Myndighet)-[:ÄGER]->(Register)`

---

### `:SAMARBETAR_MED`

**Pattern:** `(Myndighet)-[:SAMARBETAR_MED]->(Myndighet)`

**Properties:**
```typescript
{
  typ: "Datadelning" | "Gemensam kontroll" | "Samordning"
  beskrivning?: string
}
```

---

### `:KRÄVER_DATA`

**Pattern:** `(Uppgiftskrav)-[:KRÄVER_DATA]->(Datatyp)`

---

### `:HAR_RISKKLASS`

**Pattern:** `(Verksamhetstyp)-[:HAR_RISKKLASS]->(Riskfaktor)`

**Properties:**
```typescript
{
  poäng: number                 // Bidrag till total riskklass
}
```

---

## Graph Patterns (Common Queries)

### 1. Hitta alla krav för en verksamhetstyp

```cypher
MATCH (v:Verksamhetstyp {id: $verksamhetId})-[:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)
MATCH (k)-[:STÄLLS_AV]->(m:Myndighet)
RETURN v, k, m
```

### 2. Identifiera myndighetsöverlapp

```cypher
MATCH (m1:Myndighet)-[:STÄLLER]->(:Uppgiftskrav)<-[:MÅSTE_UPPFYLLA]-(v:Verksamhetstyp)
MATCH (m2:Myndighet)-[:STÄLLER]->(:Uppgiftskrav)<-[:MÅSTE_UPPFYLLA]-(v)
WHERE m1 <> m2
RETURN m1, m2, v, COUNT(*) as överlapp
ORDER BY överlapp DESC
```

### 3. Verksamheter med höga riskklas

```cypher
MATCH (v:Verksamhetstyp)
WHERE v.riskKlass >= 4
RETURN v.namn, v.riskKlass
ORDER BY v.riskKlass DESC
```

### 4. Hitta alla lagstöd för en verksamhetstyp

```cypher
MATCH (v:Verksamhetstyp {id: $id})-[:MÅSTE_UPPFYLLA]->(k)-[:BASERAS_PÅ]->(l:Lag)
RETURN DISTINCT l
```

### 5. Graf för visualisering (subset)

```cypher
MATCH (v:Verksamhetstyp)-[r:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)-[:STÄLLS_AV]->(m:Myndighet)
WHERE v.kategori = $kategori
RETURN v, r, k, m
LIMIT 100
```

---

## Constraints & Indexes

### Constraints (Uniqueness)

```cypher
CREATE CONSTRAINT verksamhetstyp_id IF NOT EXISTS
FOR (v:Verksamhetstyp) REQUIRE v.id IS UNIQUE;

CREATE CONSTRAINT uppgiftskrav_id IF NOT EXISTS
FOR (k:Uppgiftskrav) REQUIRE k.id IS UNIQUE;

CREATE CONSTRAINT myndighet_id IF NOT EXISTS
FOR (m:Myndighet) REQUIRE m.id IS UNIQUE;

CREATE CONSTRAINT register_id IF NOT EXISTS
FOR (r:Register) REQUIRE r.id IS UNIQUE;

CREATE CONSTRAINT lag_id IF NOT EXISTS
FOR (l:Lag) REQUIRE l.id IS UNIQUE;
```

### Indexes (Performance)

```cypher
CREATE INDEX verksamhetstyp_riskklass IF NOT EXISTS
FOR (v:Verksamhetstyp) ON (v.riskKlass);

CREATE INDEX verksamhetstyp_kategori IF NOT EXISTS
FOR (v:Verksamhetstyp) ON (v.kategori);

CREATE INDEX uppgiftskrav_status IF NOT EXISTS
FOR (k:Uppgiftskrav) ON (k.status);

CREATE INDEX myndighet_namn IF NOT EXISTS
FOR (m:Myndighet) ON (m.namn);

CREATE FULLTEXT INDEX verksamhetstyp_search IF NOT EXISTS
FOR (v:Verksamhetstyp) ON EACH [v.namn, v.beskrivning];
```

---

## Data Validation Rules

### Node Creation
1. All nodes MUST have `id`, `createdAt`
2. `id` ska vara prefixad: `vt-`, `uk-`, `myn-`, `reg-`, `lag-`
3. Timestamps ska vara ISO 8601 format
4. Enums ska valideras (ex: `riskKlass` endast 1-5)

### Relationship Creation
1. Före skapande: validera att source och target nodes finns
2. Undvik duplicerade relationships (MERGE istället för CREATE)
3. Properties ska vara optional men typade

### Data Synchronization
- Source of truth: External APIs
- Update frequency: Weekly (automated)
- Conflict resolution: External data vinner
- Audit log: Sparas i PostgreSQL (future)

---

## Evolution Strategy

### Version 0.1.0 (Current)
- Core node types (Verksamhetstyp, Uppgiftskrav, Myndighet)
- Basic relationships
- Manual seeding

### Version 0.2.0 (Planned)
- Add `:Register`, `:Lag`, `:Datatyp` nodes
- More relationship types
- Automated sync from APIs

### Version 1.0.0 (Production)
- Full coverage of livsmedel sector
- Historical versioning of nodes
- Graph analytics (centrality, communities)
- Multi-sector support

---

**Related Documents:**
- [Architecture Overview](./ARCHITECTURE.md)
- [API Specification](./API_SPECIFICATION.md)
- [ADR-002: Graph Database Choice](../decisions/ADR-002-graph-database.md)
