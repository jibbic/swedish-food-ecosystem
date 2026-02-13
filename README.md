# Swedish Food Ecosystem - Knowledge Graph

> Visualisering och navigering av Sveriges livsmedelssektors myndighetskrav och relationer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.26-green)](https://neo4j.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Översikt

Swedish Food Ecosystem är en interaktiv kunskapsgraf som kartlägger och visualiserar:

- **Myndigheter** och deras ansvar inom livsmedelssektorn
- **Uppgiftskrav** från Tillväxtverkets register
- **Verksamhetstyper** och deras riskklassning (Livsmedelsverket)
- **Dataflöden** och relationer mellan aktörer
- **Lagstöd** och juridiska grunder

### Målgrupper

**1. Livsmedelsföretagare**
- Förstå vilka krav som gäller för din verksamhetstyp
- Navigera myndighetskontakter och deadlines
- Få en checklista för att starta eller expandera verksamhet

**2. Myndigheter**
- Identifiera överlappande krav och dataflöden
- Analysera förenklingsmöjligheter
- Visualisera det digitala ekosystemet

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.0.0
- Docker & Docker Compose
- Git

### Installation

```bash
# Klona projektet
git clone <repository-url>
cd swedish-food-ecosystem

# Kopiera environment-variablerna
cp .env.example .env

# Installera dependencies
npm install

# Starta Neo4j och PostgreSQL
npm run neo4j:start

# Seed database med testdata
npm run seed

# Starta utvecklingsserver
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

Neo4j Browser finns på [http://localhost:7474](http://localhost:7474)
- Username: `neo4j`
- Password: `foodsystem2026`

## 📚 Dokumentation

Fullständig dokumentation finns i [`/docs`](./docs):

- [Architecture Overview](./docs/architecture/ARCHITECTURE.md)
- [Data Model](./docs/architecture/DATA_MODEL.md)
- [Product Requirements](./docs/requirements/PRODUCT_REQUIREMENTS.md)
- [Setup Guide](./docs/development/SETUP.md)
- [Architecture Decision Records](./docs/decisions/)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework med App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Cytoscape.js** - Graf-visualisering
- **Framer Motion** - Animationer
- **Recharts** - Statistik-charts

### Backend
- **Next.js API Routes** - REST endpoints
- **tRPC** - Type-safe API layer
- **Zod** - Schema validation

### Databaser
- **Neo4j** - Knowledge graph (relationer)
- **PostgreSQL** - Strukturerad data

### Data Sources
- **Uppgiftskrav.se** - XML feed med myndighetskrav
- **Livsmedelsverkets API** - Riskklassning och verksamhetstyper

## 📁 Project Structure

```
swedish-food-ecosystem/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── (dashboard)/    # Main app pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── graph/          # Cytoscape components
│   │   ├── ui/             # Reusable UI components
│   │   └── wizards/        # User flows
│   ├── lib/
│   │   ├── neo4j/          # Neo4j connection & queries
│   │   ├── parsers/        # Data source parsers
│   │   ├── seed/           # Database seeding
│   │   └── trpc/           # tRPC setup
│   └── types/              # TypeScript types
├── docs/                   # Documentation
├── neo4j/                  # Neo4j volumes
├── public/                 # Static assets
└── docker-compose.yml      # Infrastructure
```

## 🎯 Features

### MVP (v0.1.0)

- [x] Projektstruktur och setup
- [ ] Verksamhetstyp-selector med riskklassning
- [ ] Interaktiv knowledge graph (Cytoscape.js)
- [ ] Uppgiftskrav-checklista per verksamhetstyp
- [ ] Myndighetsöversikt med kontaktinfo
- [ ] Basic filter och sökning

### Planned (v0.2.0+)

- [ ] Överlapp-analys för myndigheter
- [ ] Export till PDF/CSV
- [ ] Notifieringar vid nya krav
- [ ] Multi-step wizard för företagare
- [ ] Integration med fler datakällor

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start Neo4j
npm run neo4j:start

# Stop Neo4j
npm run neo4j:stop

# Seed database
npm run seed
```

## 🗄️ Database Management

### Neo4j

```bash
# Access Neo4j Browser
open http://localhost:7474

# Run Cypher queries
MATCH (n) RETURN n LIMIT 25
MATCH (v:Verksamhetstyp)-[:MÅSTE_UPPFYLLA]->(k:Uppgiftskrav) RETURN v, k
```

### Seeding Data

```bash
npm run seed
```

Seeding-scriptet:
1. Hämtar data från Uppgiftskrav.se och Livsmedelsverkets API
2. Transformerar och normaliserar data
3. Skapar nodes och relationships i Neo4j
4. Validerar dataqualitet

## 📊 Data Sources

| Source | Type | License | Update Frequency |
|--------|------|---------|------------------|
| [Uppgiftskrav.se](https://www.uppgiftskrav.se) | XML | CC0 | Realtid |
| [Livsmedelsverket](https://dataportal.livsmedelsverket.se) | REST API | Public | On-demand |

## 🤝 Contributing

Vi välkomnar bidrag! Se [CONTRIBUTING.md](./docs/development/CONTRIBUTING.md) för guidelines.

## 📝 License

MIT License - se [LICENSE](LICENSE) för detaljer.

## 🙏 Acknowledgments

- **Tillväxtverket** - För öppna uppgiftskrav-data
- **Livsmedelsverket** - För riskklassnings-API
- **Digg** - För Sveriges Dataportal

## 📧 Contact

För frågor eller feedback, kontakta [projektägare].

---

**Status**: 🚧 Under aktiv utveckling (v0.1.0)

**Started**: February 2026
