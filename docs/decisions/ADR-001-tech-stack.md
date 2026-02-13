# Architecture Decision Record: Tech Stack Selection

**ADR ID**: 001  
**Status**: Accepted  
**Date**: 2026-02-12  
**Deciders**: Project Team  
**Technical Story**: Initial project scaffolding

---

## Context

Vi behöver välja en teknisk stack för Swedish Food Ecosystem som uppfyller följande krav:

1. **Modern och maintainable**: Aktivt underhållen med stor community
2. **Type-safe**: Minimera runtime errors
3. **Developer Experience**: Snabb iteration cycles
4. **Performance**: Snabb load time och interaktivitet
5. **Skalbar**: Kan växa från MVP till production
6. **Flexibel**: Lätt att integrera olika datakällor

---

## Decision

Vi använder följande stack:

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5.7**
- **Tailwind CSS 3.4**

### Backend
- **Next.js API Routes**
- **tRPC 11** för type-safe API
- **Zod** för runtime validation

### Databaser
- **Neo4j 5.26 Community** (graph database)
- **PostgreSQL 16** (supplementary, future)

### Visualisering
- **Cytoscape.js** för graf-rendering
- **Recharts** för statistik/charts
- **Framer Motion** för animationer

### Infrastructure
- **Docker Compose** (local dev)
- **Vercel** (deployment)
- **Railway/Render** (Neo4j hosting, planned)

---

## Rationale

### Why Next.js?

**Pros:**
- Fullstack framework (frontend + API routes i samma projekt)
- App Router med React Server Components (performance)
- Excellent DX med Fast Refresh
- Built-in optimizations (Image, Font, etc.)
- Zero-config TypeScript
- Vercel deployment är frictionless
- Stor community och ecosystem

**Cons:**
- Vendor lock-in risk med Vercel (mitigerat: kan deployas anywhere)
- App Router relativt nytt (men stabil sedan v13)

**Alternatives Considered:**
- **SvelteKit**: Mindre ecosystem, team inte lika bekväm
- **Remix**: Bra, men mindre community än Next.js
- **Vite + React**: Måste bygga backend separat

**Verdict**: Next.js ger bäst balans mellan DX, performance och flexibilitet.

---

### Why TypeScript?

**Pros:**
- Catch errors vid compile time
- Excellent IDE support (autocomplete, refactoring)
- Self-documenting kod
- tRPC kräver TypeScript

**Cons:**
- Något mer boilerplate
- Learning curve för team

**Verdict**: Non-negotiable för projekt av denna storlek.

---

### Why tRPC?

**Pros:**
- End-to-end type safety (frontend känner till backend types)
- Ingen code generation (infererar direkt)
- Snabbare development än REST + OpenAPI
- Excellent with Next.js

**Cons:**
- Inte standard REST (svårare för externa consumers)
- Kräver TypeScript på både frontend och backend

**Alternatives:**
- **GraphQL**: Mer komplext setup, overkill för vårt use case
- **REST + OpenAPI**: Mer boilerplate, loss of type inference
- **FastAPI** (Python): Splittrar stack, team föredrar TS

**Verdict**: tRPC perfekt för fullstack TypeScript monolith.

---

### Why Neo4j?

Se [ADR-002: Graph Database Choice](./ADR-002-graph-database.md)

---

### Why Tailwind CSS?

**Pros:**
- Utility-first = snabb prototyping
- Ingen CSS-in-JS runtime overhead
- Purging → minimal production bundle
- Excellent design system med custom theme

**Cons:**
- Verbost HTML (många classes)
- Learning curve för CSS-purister

**Alternatives:**
- **CSS Modules**: Mer boilerplate
- **Styled Components**: Runtime overhead
- **Plain CSS**: Svårt att maintaina i stora projekt

**Verdict**: Tailwind ger bäst DX och performance.

---

### Why Cytoscape.js?

**Pros:**
- Mature, battle-tested graph rendering library
- Många layout algorithms (force-directed, hierarchical, etc.)
- Extensibel med plugins
- Bra performance för <1000 nodes
- Excellent documentation

**Cons:**
- Inte React-native (måste wrappa)
- Styling-API lite klumpigt

**Alternatives:**
- **D3.js**: Mer low-level, längre development tid
- **vis.js**: Färre features
- **React Flow**: Bättre för directed graphs (workflows), mindre för knowledge graphs

**Verdict**: Cytoscape.js har bäst balans för vårt use case.

---

### Why Docker Compose?

**Pros:**
- Konsistent dev environment för alla devs
- Neo4j + PostgreSQL i containers
- Lätt att starta/stoppa databaser
- Production-like lokalt

**Cons:**
- Kräver Docker installerat
- Något overhead

**Alternatives:**
- **Lokala installs**: Inconsistent mellan devs
- **Kubernetes**: Overkill för local dev

**Verdict**: Docker Compose är standard för multi-service local dev.

---

## Consequences

### Positive

1. **Snabb onboarding**: Modern stack som många devs känner till
2. **Type safety**: Färre bugs, bättre refactoring
3. **Monolith simplicity**: Ett repo, ett deployment
4. **Great DX**: Fast Refresh, autocomplete, etc.
5. **Future-proof**: Alla teknologier är aktivt maintained

### Negative

1. **Learning curve för tRPC**: Team måste lära sig konceptet
2. **Next.js abstraction**: Svårare att debugga "magic"
3. **Neo4j specialisering**: Kräver Cypher-kunskap
4. **Vercel cost i prod**: Kan bli dyrt vid hög trafik

### Neutral

1. **Monorepo**: Allt i ett repo kan bli stort, men manageable med god struktur
2. **TypeScript verbosity**: Mer kod, men tydligare

---

## Validation

Vi kommer validera detta beslut genom att:

1. **Vecka 1-2**: Utvärdera DX under MVP development
2. **Vecka 3**: Mäta graf-rendering performance
3. **Vecka 4**: Code review för type safety coverage
4. **Beslutspunkt**: Vid problem, ompröva efter MVP

Om vi ser major issues kan vi:
- Byta från tRPC till GraphQL (om externa API behövs)
- Separera frontend/backend (om monolith blir problem)
- Addera Vite för snabbare HMR (om Next.js för långsamt)

---

## Related Decisions

- [ADR-002: Graph Database Choice](./ADR-002-graph-database.md)
- [ADR-003: API Layer Design](./ADR-003-api-layer.md) (TBD)

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Cytoscape.js](https://js.cytoscape.org/)
- [Tailwind CSS](https://tailwindcss.com)

---

**Author**: Project Team  
**Reviewers**: [Names]  
**Last Updated**: 2026-02-12
