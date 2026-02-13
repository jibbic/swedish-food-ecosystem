# Architecture Overview

**Version**: 0.1.0  
**Last Updated**: 2026-02-12  
**Status**: In Development

## System Architecture

Swedish Food Ecosystem är en fullstack Next.js-applikation med en hybrid databasarkitektur som kombinerar grafdatabas (Neo4j) för relationer med relationsdatabas (PostgreSQL) för strukturerad data.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  Next.js 15 + React 19 + TypeScript                 │
│  ├─ App Router (SSR/SSG)                            │
│  ├─ Cytoscape.js (Graf-visualisering)              │
│  ├─ Framer Motion (Animationer)                     │
│  └─ Tailwind CSS (Styling)                          │
└──────────────────┬──────────────────────────────────┘
                   │ tRPC (Type-safe API)
┌──────────────────┴──────────────────────────────────┐
│                   Backend Layer                      │
│  Next.js API Routes + tRPC                          │
│  ├─ Query Resolvers                                 │
│  ├─ Data Transformation                             │
│  ├─ Business Logic                                  │
│  └─ Authentication (Future)                         │
└──────────┬─────────────────────┬────────────────────┘
           │                     │
    ┌──────┴─────┐        ┌─────┴──────┐
    │   Neo4j    │        │ PostgreSQL │
    │  (Graph)   │        │ (Relational)│
    └────────────┘        └────────────┘
           │
    ┌──────┴──────────────────────────────┐
    │        Data Ingestion Layer         │
    │  ├─ Uppgiftskrav.se XML Parser      │
    │  ├─ Livsmedelsverket API Client     │
    │  ├─ Data Validators                 │
    │  └─ ETL Pipelines                   │
    └─────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/app/
├── (dashboard)/                # Main application
│   ├── page.tsx               # Dashboard home
│   ├── ekosystem/             # Graph visualization
│   │   └── page.tsx
│   ├── verksamheter/          # Business types
│   │   ├── page.tsx           # List view
│   │   └── [id]/              # Detail page
│   │       └── page.tsx
│   ├── myndigheter/           # Authorities
│   └── wizard/                # Onboarding wizard
└── api/                       # API routes
    └── trpc/                  # tRPC router

src/components/
├── graph/
│   ├── EcosystemGraph.tsx     # Main graph component
│   ├── GraphControls.tsx      # Zoom, filter, search
│   ├── NodeDetails.tsx        # Click → detail panel
│   └── GraphLegend.tsx        # Node type legend
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Select.tsx
│   └── ... (reusable components)
└── wizards/
    ├── VerksamhetstypWizard.tsx
    └── RequirementsChecklist.tsx
```

### Data Layer

```
src/lib/
├── neo4j/
│   ├── client.ts              # Connection setup
│   ├── queries.ts             # Cypher queries
│   └── schema.ts              # Type definitions
├── parsers/
│   ├── uppgiftskrav.ts        # XML → JSON
│   └── livsmedelsverket.ts    # API client
├── seed/
│   ├── index.ts               # Main seeding script
│   ├── uppgiftskrav-seed.ts
│   └── verksamhetstyper-seed.ts
└── trpc/
    ├── router.ts              # Main router
    └── procedures/
        ├── verksamheter.ts
        ├── uppgiftskrav.ts
        └── graph.ts
```

## Data Flow

### 1. Data Ingestion (Seeding)

```
External Sources
     ↓
  Parsers
     ↓
  Validators
     ↓
  Transformers
     ↓
  Neo4j Writes
```

**Process:**
1. Fetch raw data from APIs/XML
2. Parse to intermediate JSON format
3. Validate against Zod schemas
4. Transform to graph model
5. Create nodes and relationships
6. Log success/errors

### 2. User Query Flow

```
User Action (Frontend)
     ↓
  tRPC Client Call
     ↓
  Backend Resolver
     ↓
  Neo4j Cypher Query
     ↓
  Transform Results
     ↓
  Return Typed Data
     ↓
  React Component Render
```

### 3. Graph Visualization Flow

```
User selects filters
     ↓
tRPC: getEcosystemGraph({ filters })
     ↓
Neo4j: MATCH with WHERE clauses
     ↓
Return { nodes, edges }
     ↓
Cytoscape.js renders graph
     ↓
User interacts (click, zoom)
     ↓
React state updates → UI updates
```

## Database Strategy

### Neo4j (Primary Graph Database)

**Use Cases:**
- Relationer mellan entiteter
- Graf-queries (traversals)
- Pattern matching
- Shortest paths
- Recommendations

**Performance:**
- Index på `:Verksamhetstyp(id)`
- Index på `:Uppgiftskrav(id)`
- Index på `:Myndighet(namn)`
- Constraint: Unique IDs

### PostgreSQL (Supplementary)

**Use Cases (Future):**
- User accounts och sessions
- Audit logs
- Cached aggregations
- Full-text search metadata

## Scalability Considerations

### Current (MVP - <10k nodes)
- Single Neo4j instance
- No caching layer
- SSR för SEO, CSR för interactivity

### Future (>10k nodes, production)
- **Redis cache** för frequently-accessed queries
- **CDN** för static assets (Vercel edge)
- **Read replicas** för Neo4j (Enterprise)
- **Incremental Static Regeneration** för semi-static pages
- **Pagination** för stora dataset

## Security Architecture

### Current (Development)
- No authentication
- Public read-only access
- Rate limiting via Next.js middleware (Future)

### Production (Planned)
- **Authentication**: Next-Auth.js
- **Authorization**: Role-based (Admin, Myndighet, Public)
- **API Security**: 
  - Rate limiting (100 req/min)
  - CORS configuration
  - Input validation (Zod)
- **Database**: 
  - Neo4j: User-based access control
  - PostgreSQL: Row-level security

## Deployment Architecture

### Development
```
Local Machine
├── Next.js (localhost:3000)
├── Neo4j (Docker, localhost:7687)
└── PostgreSQL (Docker, localhost:5432)
```

### Production (Proposed)
```
Vercel (Frontend + API Routes)
     ↓
Railway/Render (Neo4j hosted)
     ↓
Supabase/Neon (PostgreSQL)
```

## Monitoring & Observability (Future)

- **Logging**: Pino / Winston
- **Tracing**: OpenTelemetry
- **Metrics**: Vercel Analytics
- **Errors**: Sentry
- **Uptime**: Better Stack

## Technology Decisions

Key architecture decisions are documented in [Architecture Decision Records](../decisions/).

- [ADR-001: Tech Stack Selection](../decisions/ADR-001-tech-stack.md)
- [ADR-002: Graph Database Choice](../decisions/ADR-002-graph-database.md)
- [ADR-003: API Layer Design](../decisions/ADR-003-api-layer.md)

## Performance Targets

| Metric | Target (MVP) | Target (Production) |
|--------|-------------|---------------------|
| First Contentful Paint | < 2s | < 1s |
| Graph Render (200 nodes) | < 3s | < 1.5s |
| API Response Time (p95) | < 500ms | < 200ms |
| Time to Interactive | < 4s | < 2s |

## Development Workflow

```
Feature Branch
     ↓
Local Development + Testing
     ↓
Type Check (tsc) + Lint (eslint)
     ↓
Pull Request
     ↓
Code Review
     ↓
CI/CD (GitHub Actions)
     ├─ Tests
     ├─ Build
     └─ Deploy Preview
     ↓
Merge to main
     ↓
Production Deploy (Vercel)
```

---

**Next Steps:**
1. Implement core tRPC procedures
2. Build EcosystemGraph component
3. Create seeding scripts
4. Add comprehensive tests
