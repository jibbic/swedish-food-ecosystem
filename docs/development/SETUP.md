# Setup Guide

**Version**: 0.1.0  
**Last Updated**: 2026-02-12

Denna guide hjälper dig att sätta upp Swedish Food Ecosystem lokalt för utveckling.

---

## Prerequisites

Installera följande innan du börjar:

### Required
- **Node.js**: >= 20.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 10.0.0 (kommer med Node.js)
- **Docker Desktop**: ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**: ([Download](https://git-scm.com/))

### Recommended
- **VS Code**: Med extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Neo4j Cypher
- **Windows Terminal** eller annan modern terminal

### Verify Installation

```powershell
node --version    # v20.0.0 eller högre
npm --version     # v10.0.0 eller högre
docker --version  # Docker version 24.0 eller högre
git --version     # git version 2.40 eller högre
```

---

## Installation

### 1. Clone Repository

```powershell
cd "S:\Martins kod"
git clone <repository-url> swedish-food-ecosystem
cd swedish-food-ecosystem
```

### 2. Install Dependencies

```powershell
npm install
```

Detta installerar:
- Next.js 15 + React 19
- TypeScript + types
- tRPC + TanStack Query
- Cytoscape.js
- Tailwind CSS
- Neo4j driver
- + alla andra dependencies

**Expected time**: 2-3 minuter

### 3. Environment Variables

Kopiera example-filen och konfigurera:

```powershell
cp .env.example .env
```

Redigera `.env` och uppdatera:

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=foodsystem2026

# Database (Future)
DATABASE_URL=postgresql://foodsystem:foodsystem2026@localhost:5432/foodsystem

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Data Sources
UPPGIFTSKRAV_XML_URL=https://www.uppgiftskrav.se/uppgiftskrav/files/uppgiftskrav.xml
LIVSMEDELSVERKET_API_URL=https://dataportal.livsmedelsverket.se/riskklassningkodverk/api
```

⚠️ **Viktigt**: Ändra INTE Neo4j-lösenordet utan att också uppdatera `docker-compose.yml`

### 4. Start Databases

```powershell
npm run neo4j:start
```

Detta startar:
- Neo4j Community Edition (port 7474 browser, 7687 bolt)
- PostgreSQL 16 (port 5432)

**Första gången tar 1-2 minuter** då Docker laddar ner images.

Verifiera att Neo4j är igång:
```powershell
# Öppna Neo4j Browser
start http://localhost:7474
```

**Login:**
- Username: `neo4j`
- Password: `foodsystem2026`

### 5. Seed Database

Importera initial data:

```powershell
npm run seed
```

Detta:
1. Hämtar data från Uppgiftskrav.se och Livsmedelsverkets API
2. Parsear och validerar XML/JSON
3. Skapar nodes och relationships i Neo4j
4. Validerar dataqualitet

**Expected output:**
```
🌱 Seeding database...
✅ Fetched 245 uppgiftskrav from Uppgiftskrav.se
✅ Fetched 87 verksamhetstyper from Livsmedelsverket
✅ Created 245 Uppgiftskrav nodes
✅ Created 87 Verksamhetstyp nodes
✅ Created 15 Myndighet nodes
✅ Created 523 relationships
🎉 Seeding complete in 12.3s
```

⚠️ **If seeding fails**:
- Check Neo4j är igång: `docker ps`
- Kolla logs: `docker logs foodsystem-neo4j`
- Testa Neo4j connection: Öppna http://localhost:7474

### 6. Start Development Server

```powershell
npm run dev
```

Öppna browser: [http://localhost:3000](http://localhost:3000)

**Expected output:**
```
▲ Next.js 15.1.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.1s
```

---

## Development Workflow

### Daily Workflow

```powershell
# 1. Start databases (om ej redan igång)
npm run neo4j:start

# 2. Start dev server
npm run dev

# 3. Koda! Hot reload fungerar automatiskt

# 4. När du är klar
npm run neo4j:stop
```

### Common Commands

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint check
npm run type-check       # TypeScript check

# Database
npm run neo4j:start      # Start Neo4j + PostgreSQL
npm run neo4j:stop       # Stop databases
npm run seed             # (Re)seed database with fresh data

# Testing (Future)
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## Project Structure

```
swedish-food-ecosystem/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Main application routes
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── ekosystem/      # Graf-sida
│   │   │   ├── verksamheter/   # Verksamhetstyper
│   │   │   └── myndigheter/    # Myndighetslista
│   │   ├── api/                # API routes
│   │   │   └── trpc/           # tRPC router
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── graph/              # Cytoscape-relaterat
│   │   │   ├── EcosystemGraph.tsx
│   │   │   ├── GraphControls.tsx
│   │   │   └── NodeDetails.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Select.tsx
│   │   └── wizards/            # Multi-step user flows
│   │       └── VerksamhetstypWizard.tsx
│   │
│   ├── lib/                    # Utilities & business logic
│   │   ├── neo4j/              # Neo4j connection
│   │   │   ├── client.ts       # Driver setup
│   │   │   ├── queries.ts      # Cypher queries
│   │   │   └── schema.ts       # Type definitions
│   │   ├── parsers/            # Data source parsers
│   │   │   ├── uppgiftskrav.ts # XML parser
│   │   │   └── livsmedelsverket.ts # API client
│   │   ├── seed/               # Database seeding
│   │   │   └── index.ts        # Main seeding script
│   │   ├── trpc/               # tRPC setup
│   │   │   ├── router.ts       # Main router
│   │   │   └── client.ts       # Frontend client
│   │   └── utils.ts            # Helper functions
│   │
│   └── types/                  # TypeScript definitions
│       ├── neo4j.ts            # Graph types
│       └── api.ts              # API types
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── requirements/
│   ├── decisions/              # ADRs
│   └── development/
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── neo4j/                      # Neo4j Docker volumes
│   ├── data/                   # (auto-created)
│   └── logs/                   # (auto-created)
│
├── .env                        # Environment variables (git-ignored)
├── .env.example                # Template
├── docker-compose.yml          # Docker setup
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # Project overview
```

---

## Neo4j Management

### Browser UI

Öppna Neo4j Browser: http://localhost:7474

**Useful queries:**

```cypher
// Se alla nodes (max 25)
MATCH (n) RETURN n LIMIT 25

// Räkna nodes per typ
MATCH (n) RETURN labels(n), COUNT(*)

// Hitta alla verksamhetstyper
MATCH (v:Verksamhetstyp) RETURN v

// Se alla relationer för en specifik verksamhetstyp
MATCH (v:Verksamhetstyp {kod: "01.01"})-[r]->(n)
RETURN v, r, n

// Delete all data (⚠️ VARNING)
MATCH (n) DETACH DELETE n
```

### Backup & Restore

```powershell
# Backup (exportera allt till JSON)
# (Script behöver skapas)
npm run backup

# Restore från backup
npm run restore
```

### Reset Database

```powershell
# 1. Stoppa containers
npm run neo4j:stop

# 2. Ta bort volumes
docker compose down -v

# 3. Starta igen
npm run neo4j:start

# 4. Seed fresh data
npm run seed
```

---

## Troubleshooting

### Neo4j won't start

**Problem:** `Error: Neo4j container not starting`

**Solution:**
```powershell
# Kolla status
docker ps -a

# Se logs
docker logs foodsystem-neo4j

# Common issues:
# - Port 7687 redan upptagen → Ändra port i docker-compose.yml
# - Docker inte igång → Starta Docker Desktop
# - Corrupted data → docker compose down -v
```

---

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Hitta process på port 3000
netstat -ano | findstr :3000

# Döda processen
taskkill /PID <PID> /F

# Eller använd annan port
PORT=3001 npm run dev
```

---

### npm install fails

**Problem:** `Error: EACCES permission denied`

**Solution:**
```powershell
# Windows: Kör som Administrator
# Eller rensa npm cache
npm cache clean --force
npm install
```

---

### Hot reload not working

**Problem:** Ändringar syns inte i browser

**Solution:**
1. Hårdrefresh: `Ctrl + Shift + R`
2. Restart dev server: `Ctrl + C` → `npm run dev`
3. Rensa `.next` folder: `rm -rf .next` → `npm run dev`

---

### Type errors

**Problem:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```powershell
# Full type check
npm run type-check

# Restart TypeScript server i VS Code
Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## VS Code Setup

### Recommended Extensions

Install

 via VS Code Extensions panel:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
4. **Neo4j Cypher** (`neo4j.cypher`)
5. **TypeScript Error Translator** (`matt-pocock.ts-error-translator`)

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Next Steps

1. ✅ Setup complete!
2. 📖 Read [Architecture Overview](../architecture/ARCHITECTURE.md)
3. 💡 Check [Product Requirements](../requirements/PRODUCT_REQUIREMENTS.md)
4. 🏗️ Start building features!
5. 📝 Review [Contributing Guide](./CONTRIBUTING.md) (TBD)

---

## Getting Help

- **Documentation**: Check `/docs` folder
- **Neo4j Help**: https://neo4j.com/docs/
- **Next.js Help**: https://nextjs.org/docs
- **tRPC Help**: https://trpc.io/docs

---

**Last Updated**: 2026-02-12  
**Maintainer**: [Your Name]
