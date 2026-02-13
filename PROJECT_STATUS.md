# Swedish Food Ecosystem 🇸🇪🍽️

En interaktiv kunskapsgraf för Sveriges livsmedelssektors myndighetskrav och relationer.

## ✨ Funktioner

### 🎯 Färdiga funktioner (Produktionsklar)

- ✅ **Interaktiv ekosystemgraf** - Visualisera hela ekosystemet med Cytoscape.js
  - Zoom, pan och reset-kontroller
  - Klickbara noder med detaljer
  - Färgkodning per nodtyp
  - Filter på kategori och risknivå
  - Realtidssökning över alla noder

- ✅ **Verksamhetstyper** - Komplett översikt
  - Lista med alla verksamhetstyper grupperade per kategori
  - Detaljsidor för varje verksamhetstyp
  - Riskklassning (1-5) med visuella badges
  - Alla uppgiftskrav per verksamhet
  - Berörda myndigheter
  - Koppling till wizard och graf

- ✅ **Myndighetsöversikt** - Alla relevanta myndigheter
  - Fullständig lista med filter
  - Statliga, regionala och kommunala
  - Kontaktinformation (webb, e-post, telefon)
  - Ansvar och sektor
  - Statistik över myndighettyper

- ✅ **Krav-wizard** - Guidad process
  - 3-stegs wizard med progress bar
  - Välj verksamhetstyp → Se krav → Generera checklista
  - Interaktiv kravlista med checkboxar
  - Export-funktion för checklistan (planerad)

- ✅ **Statistik & Analys** - Insikter
  - Sammanställning av nyckeltal
  - Riskfördelning med visualiseringar
  - Kategori-analys
  - Myndighettyp-fördelning
  - Topp 5 myndigheter med flest krav

- ✅ **Överlapp-analys** - För myndighetsanalytiker
  - Identifiera delade uppgiftskrav
  - Verksamheter med flera myndigheter
  - Exportfunktion till CSV
  - Förenklingsmöjligheter
  - Visualisering av redundans

### 🏗️ Teknisk stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript 5.7
- **Styling:** Tailwind CSS 3.4
- **API:** tRPC 11 (type-safe)
- **Graf:** Cytoscape.js + fcose layout
- **Databas:** Neo4j 5.26 Community (via Docker)
- **Data:** PostgreSQL 16 (supplementary, framtida användning)
- **Ikoner:** Lucide React
- **Validering:** Zod

### 📊 Datakällor

- **Uppgiftskrav:** [Uppgiftskrav.se](https://uppgiftskrav.se) (XML-feed, CC0 licens)
- **Verksamhetstyper:** Livsmedelsverkets riskkategorisering (mock data)
- **Myndigheter:** Svenska myndigheter inom livsmedelssektorn

## 🚀 Snabbstart

### Utan Docker (endast frontend med mock-data)

```bash
git clone <repo>
cd swedish-food-ecosystem
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

**OBS:** tRPC API fungerar inte utan Neo4j, men alla sidor renderar korrekt.

### Med Docker (full funktionalitet)

Se detaljerad guide i [INSTALL.md](./INSTALL.md)

```bash
# 1. Installera Docker Desktop för Windows
# 2. Starta databaserna
docker compose up -d

# 3. Installera dependencies
npm install

# 4. Fyll databasen
npm run seed

# 5. Starta dev server
npm run dev
```

## 📁 Projektstruktur

```
swedish-food-ecosystem/
├── src/
│   ├── app/                      # Next.js App Router sidor
│   │   ├── page.tsx              # Landningssida
│   │   ├── ekosystem/            # Interaktiv graf
│   │   ├── verksamheter/         # Lista + detaljsidor
│   │   ├── myndigheter/          # Myndighetslista
│   │   ├── wizard/               # Krav-wizard
│   │   ├── statistik/            # Statistik dashboard
│   │   └── overlapp/             # Överlapp-analys
│   ├── components/
│   │   ├── graph/                # Graf-komponenter
│   │   │   └── EcosystemGraph.tsx
│   │   └── ui/                   # Återanvändbara UI-komponenter
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── neo4j/                # Neo4j client + queries
│   │   ├── trpc/                 # tRPC router + client
│   │   ├── parsers/              # Data parsers (Uppgiftskrav.se, etc.)
│   │   ├── seed/                 # Database seeding
│   │   ├── mock/                 # Mock data för testning
│   │   └── utils.ts              # Hjälpfunktioner
│   └── types/
│       └── neo4j.ts              # TypeScript interfaces
├── docs/                         # Dokumentation
│   ├── architecture/             # Systemarkitektur
│   ├── requirements/             # Produktkrav (PRD)
│   └── decisions/                # Architecture Decision Records
├── docker-compose.yml            # Docker services
└── package.json                  # Dependencies
```

## 📖 Användning

### För Livsmedelsföretagare

1. **Starta här** - Gå till wizard och välj din verksamhetstyp
2. **Se krav** - Få en komplett lista över alla krav
3. **Checklista** - Generera en checklista för att säkerställa compliance
4. **Kontakta** - Hitta rätt myndighet för frågor

### För Myndighetsanalytiker

1. **Ekosystemgraf** - Visualisera hela nätverket av relationer
2. **Filter** - Fokusera på specifika kategorier eller risknivåer
3. **Överlapp-analys** - Identifiera redundanta krav
4. **Statistik** - Få insikter om systemets struktur
5. **Export** - Exportera data för vidare analys

## 🔧 Utveckling

```bash
# Starta dev server
npm run dev

# Bygg för produktion
npm run build

# Kör TypeScript type-check
npm run type-check

# Lint koden
npm run lint

# Seed databasen
npm run seed

# Starta Docker containers
docker compose up -d

# Stoppa Docker containers
docker compose down
```

## 📚 Dokumentation

- **[INSTALL.md](./INSTALL.md)** - Detaljerad installationsguide
- **[ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** - Systemarkitektur
- **[DATA_MODEL.md](./docs/architecture/DATA_MODEL.md)** - Neo4j schema & queries
- **[PRODUCT_REQUIREMENTS.md](./docs/requirements/PRODUCT_REQUIREMENTS.md)** - Produktkrav
- **[ADR-001](./docs/decisions/ADR-001-tech-stack.md)** - Teknikval
- **[ADR-002](./docs/decisions/ADR-002-graph-database.md)** - Grafdatabas-val

## 🎨 Design System

All UI bygger på ett konsekvent design system med:
- **Färgschema:** Blå (myndighet), Orange (uppgiftskrav), Grön (verksamhet)
- **Risk-gradient:** Grön (1) → Gul (3) → Röd (5)
- **Typografi:** Inter font family
- **Komponenter:** Återanvändbara Button, Card, Badge

Se [DESIGN_SYSTEM_DOCUMENTATION.md](./DESIGN_SYSTEM_DOCUMENTATION.md) för detaljer.

## 🚢 Deployment

### Vercel (Rekommenderat)

```bash
vercel
```

### Andra plattformar

- **Netlify:** Stöder Next.js via adapter
- **Railway:** Stöder både Next.js och Neo4j
- **AWS/Azure:** Kräver container eller serverless configuration

**OBS:** Neo4j måste hostas separat (Neo4j Aura, Railway, eller självhostat).

## 🔐 Miljövariabler

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=foodsystem2026

# PostgreSQL (framtida användning)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodsystem

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐛 Felsökning

### "Neo4j connection failed"

1. Kontrollera att Docker Desktop körs
2. Kör `docker compose ps` för att se status
3. Vänta 30-60 sekunder efter start
4. Besök http://localhost:7474 för att testa

### "Port already in use"

Dev servern hittar automatiskt nästa lediga port. Kolla terminalen.

### Cytoscape graf renderar inte

1. Öppna webbläsarens devtools (F12)
2. Kontrollera för JavaScript-fel
3. Testa att ladda om sidan
4. Kontrollera att data finns i Neo4j

## 🤝 Bidrag

Detta är ett koncept-projekt. För att bidra:
1. Fork repositoryt
2. Skapa en feature branch
3. Implementera din feature + tester
4. Skicka en Pull Request

## 📄 Licens

**MIT License**

Data från Uppgiftskrav.se är licensierat under CC0 (public domain).

## 🙏 Erkännanden

- **Tillväxtverket** - Uppgiftskrav.se API
- **Livsmedelsverket** - Riskkategorisering
- **Neo4j** - Graph database
- **Vercel** - Next.js framework

## 📞 Kontakt

För frågor eller support, öppna en issue på GitHub.

---

**Status:** ✅ Produktionsklar MVP (December 2024)

**Senast uppdaterad:** 2024-12-20
