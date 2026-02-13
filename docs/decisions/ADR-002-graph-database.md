# Architecture Decision Record: Graph Database Choice

**ADR ID**: 002  
**Status**: Accepted  
**Date**: 2026-02-12  
**Deciders**: Project Team  
**Technical Story**: Data model design

---

## Context

Swedish Food Ecosystem behöver lagra och query:a komplexa relationer mellan:
- Myndigheter
- Uppgiftskrav
- Verksamhetstyper
- Register
- Lagstöd
- Dataflöden

Typiska queries:
- "Vilka krav måste en restaurang uppfylla?"
- "Vilka myndigheter ställer överlappande krav?"
- "Visa alla relationer för Livsmedelsverket"
- "Hitta kortaste vägen mellan två myndigheter"

Traditionella relationsdatabaser kräver många JOINs och blir långsamma för graph traversals. Vi behöver utvärdera om en graph database är rätt val.

---

## Decision

Vi använder **Neo4j Community Edition 5.26** som primär databas för knowledge graph.

PostgreSQL behålls som supplementary database för:
- User accounts (future)
- Audit logs
- Cached aggregations

---

## Evaluation Criteria

| Criteria | Weight | Neo4j | PostgreSQL | MongoDB | RDF Store |
|----------|--------|-------|------------|---------|-----------|
| Query Performance (traversals) | 30% | 9/10 | 4/10 | 5/10 | 7/10 |
| Data Model Fit | 25% | 10/10 | 5/10 | 6/10 | 8/10 |
| Developer Experience | 20% | 8/10 | 9/10 | 7/10 | 5/10 |
| Community & Support | 10% | 9/10 | 10/10 | 8/10 | 6/10 |
| Hosting & Ops | 10% | 7/10 | 9/10 | 8/10 | 5/10 |
| Cost | 5% | 8/10 | 9/10 | 8/10 | 7/10 |
| **Weighted Score** | | **8.35** | **6.35** | **6.45** | **6.75** |

---

## Detailed Analysis

### Neo4j

**Pros:**
- **Native graph storage**: Nodes och relationships är first-class citizens
- **Cypher query language**: Intuitivt för graph patterns
  ```cypher
  MATCH (v:Verksamhetstyp)-[:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)-[:STÄLLS_AV]->(m:Myndighet)
  WHERE v.riskKlass > 3
  RETURN v, k, m
  ```
- **Index-free adjacency**: O(1) traversals (ingen JOIN overhead)
- **Excellent visualization**: Built-in Neo4j Browser
- **APOC library**: 450+ utility procedures
- **Strong community**: 150k+ developers
- **Good TypeScript support**: neo4j-driver npm package

**Cons:**
- **Learning curve**: Cypher är nytt för teamet
- **Overkill för simpla queries**: SELECT * blir MATCH (n) RETURN n
- **Hosting complexity**: Färre managed options än PostgreSQL
- **License**: Community Edition gratis, Enterprise dyrt
- **Backup**: Mindre trivial än PostgreSQL dumps

**Performance:**
- 1000 nodes + 5000 edges: <100ms queries
- Traversal av 3 hops: ~50ms vs ~500ms för PostgreSQL med JOINs

---

### PostgreSQL (with recursive CTEs)

**Pros:**
- **Mature och välbekant**: Team känner till SQL
- **Excellent tooling**: pgAdmin, Supabase, etc.
- **Många hosting options**: Supabase, Neon, RDS, etc.
- **JSONB support**: Semi-structured data
- **Transaction guarantees**: ACID compliance
- **Backup & replication**: Välbeprövat

**Cons:**
- **Graph queries är klumpiga**:
  ```sql
  WITH RECURSIVE graph AS (
    SELECT id, parent_id, 1 as depth FROM nodes WHERE id = $start
    UNION ALL
    SELECT n.id, n.parent_id, g.depth + 1
    FROM nodes n JOIN graph g ON n.parent_id = g.id
    WHERE g.depth < 5
  )
  SELECT * FROM graph;
  ```
- **Performance degradation**: Många JOINs för djupa traversals
- **Index explosion**: Behöver index på alla foreign keys
- **Not semantic**: Relationer är implicit (foreign keys)

**When to use:**
- User accounts & sessions
- Audit logs med tidsstämplar
- Cached query results (materialized views)

---

### MongoDB (with $graphLookup)

**Pros:**
- **Schema flexibility**: Lätt att evolve modellen
- **Good TypeScript support**: Mongoose, Prisma
- **Atlas hosting**: Managed MongoDB cloud
- **$graphLookup**: Native graph queries (sedan v3.4)

**Cons:**
- **Graph queries ändå klumpiga**: $graphLookup är inte lika expressivt som Cypher
- **Performance**: Långsammare än Neo4j för multi-hop traversals
- **Not purpose-built**: Graph är sekundär feature

**Verdict**: Bättre än PostgreSQL för grafer, men sämre än Neo4j.

---

### RDF Triplestore (Apache Jena Fuseki, GraphDB)

**Pros:**
- **Semantic Web standard**: SPARQL, OWL, RDF
- **Reasoning capabilities**: Inferera nya relationer
- **Excellent för ontologies**: Om vi vill följa Linked Data-principer
- **SPARQL queries**: Expressivt för komplexa patterns

**Cons:**
- **Steep learning curve**: SPARQL, URIs, Turtle-syntax
- **Overkill för vårt use case**: Vi behöver inte reasoning (än)
- **Mindre community**: Färre Neo4j users
- **Hosting**: Färre managed options
- **Tooling**: Sämre Developer Experience

**When to use:**
- Akademiska projekt
- När interoperabilitet med Linked Open Data behövs
- Multi-ontology reasoning

**Verdict**: Intressant för v2.0 om vi vill följa Semantic Web-standards, men för komplext för MVP.

---

## Hybrid Approach

**Beslut**: Använd **Neo4j för graph** + **PostgreSQL för tabulär data**

| Data Type | Database | Rationale |
|-----------|----------|-----------|
| Verksamhetstyper, Uppgiftskrav, Myndigheter | Neo4j | Core graph entities |
| Relationer (MÅSTE_UPPFYLLA, etc.) | Neo4j | Graph edges |
| User accounts | PostgreSQL | Traditional tabular data |
| Audit logs | PostgreSQL | Time-series, easy querying |
| Cached analytics | PostgreSQL | Materialized views |

---

## Implementation Plan

### Phase 1: Neo4j Only (MVP)
- All data i Neo4j
- Inga user accounts än
- Focus på graph functionality

### Phase 2: Add PostgreSQL (v0.3)
- User management
- Audit trail
- Cached queries för dashboards

### Phase 3: Optimization (v1.0)
- Redis för session cache
- CDN för static assets
- Evaluate read replicas för Neo4j

---

## Query Examples

### Neo4j (Elegant)
```cypher
// Hitta alla krav för restauranger med riskklass > 3
MATCH (v:Verksamhetstyp {kategori: "Restaurang"})-[:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav)
WHERE v.riskKlass > 3
RETURN v.namn, k.namn, k.deadline
ORDER BY k.deadline

// Identifiera myndighetsöverlapp
MATCH (m1:Myndighet)-[:STÄLLER]->(:Uppgiftskrav)<-[:MÅSTE_UPPFYLLA]-(v:Verksamhetstyp)
MATCH (m2:Myndighet)-[:STÄLLER]->(:Uppgiftskrav)<-[:MÅSTE_UPPFYLLA]-(v)
WHERE m1 <> m2
RETURN m1.namn, m2.namn, v.namn, COUNT(*) as överlapp
ORDER BY överlapp DESC
```

### PostgreSQL Equivalent (Klumpigt)
```sql
-- Samma query kräver många JOINs
SELECT v.namn, k.namn, k.deadline
FROM verksamhetstyper v
JOIN verksamhet_krav vk ON v.id = vk.verksamhet_id
JOIN uppgiftskrav k ON vk.krav_id = k.id
WHERE v.kategori = 'Restaurang' AND v.riskklass > 3
ORDER BY k.deadline;

-- Överlapp-query blir mycket komplex med self-joins
```

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Team unfamiliar med Cypher | Medium | Onboarding docs, Neo4j GraphAcademy |
| Neo4j downtime | High | Automated backups, monitoring |
| Query performance issues | Medium | Proper indexing, EXPLAIN för slow queries |
| Neo4j hosting cost | Medium | Start med Community Edition, evaluate self-hosting |
| Lock-in till Neo4j | Low | Graph data är portable (export som JSON/GraphML) |

---

## Success Metrics

Vi utvärderar detta beslut baserat på:

1. **Query performance**: 95th percentile < 500ms för graph queries
2. **Developer productivity**: Team kan skriva queries utan ständig dokumentation
3. **Data model evolution**: Lätt att addera nya node types / relationships
4. **Visualization quality**: Neo4j Browser användbart för debugging

**Review point**: Efter 4 veckor development

---

## Rollback Plan

Om Neo4j visar sig vara fel val:

1. **Fallback till PostgreSQL**:
   - Export Neo4j data via `neo4j-admin dump`
   - Transform till PostgreSQL schema (script)
   - Rewrite queries från Cypher till SQL
   - Estimated effort: 2-3 veckor

2. **Hybrid med annat graph DB**:
   - ArangoDB (multi-model)
   - AWS Neptune (managed graph)

---

## References

- [Neo4j Graph Database](https://neo4j.com/)
- [Cypher Query Language](https://neo4j.com/developer/cypher/)
- [Graph vs Relational Performance](https://neo4j.com/blog/rdbms-vs-nosql-vs-graph/)
- [PostgreSQL Recursive Queries](https://www.postgresql.org/docs/current/queries-with.html)

---

## Related Decisions

- [ADR-001: Tech Stack Selection](./ADR-001-tech-stack.md)
- [ADR-003: API Layer Design](./ADR-003-api-layer.md) (TBD)

---

**Author**: Project Team  
**Reviewers**: [Names]  
**Last Updated**: 2026-02-12
