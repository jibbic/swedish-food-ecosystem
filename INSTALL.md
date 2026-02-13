# Installation och Setup

## Snabbstart (endast frontend med mock-data)

Om du bara vill testa frontenden utan att installera Docker:

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

**Observera:** tRPC API-anrop kommer att misslyckas utan Neo4j, men frontendkomponenterna fungerar.

## Full installation med databas

### 1. Installera Docker Desktop

Ladda ner och installera Docker Desktop för Windows:
- Besök [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- Ladda ner Windows-versionen
- Installera och starta Docker Desktop
- Verifiera installation genom att köra i PowerShell:
  ```powershell
  docker --version
  docker compose version
  ```

### 2. Starta databaserna

```powershell
cd "S:\Martins kod\swedish-food-ecosystem"
docker compose up -d
```

Detta startar:
- **Neo4j** på port 7474 (webbgränssnitt) och 7687 (bolt protokoll)
- **PostgreSQL** på port 5432

Vänta 30-60 sekunder för att Neo4j ska starta helt.

### 3. Verifiera Neo4j

Öppna [http://localhost:7474](http://localhost:7474) i webbläsaren.

Logga in med:
- **URI:** neo4j://localhost:7687
- **Användarnamn:** neo4j
- **Lösenord:** foodsystem2026

### 4. Seeda databasen

```powershell
npm run seed
```

Detta fyller databasen med:
- 10+ verksamhetstyper (restauranger, bagerier, butiker, etc.)
- 50+ uppgiftskrav från Uppgiftskrav.se
- 15+ myndigheter (Livsmedelsverket, Skatteverket, etc.)
- 100+ relationer mellan entiteter

### 5. Starta utvecklingsserver

```powershell
npm run dev
```

## Miljövariabler

Kopiera `.env.example` till `.env` och justera vid behov:

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=foodsystem2026

# PostgreSQL (framtida användning)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodsystem
```

## Felsökning

### Docker startar inte

1. Kontrollera att Docker Desktop körs
2. Kontrollera att Hyper-V eller WSL2 är aktiverat i Windows
3. Starta om Docker Desktop

### Neo4j Connection Failed

1. Vänta 30-60 sekunder efter `docker compose up`
2. Kontrollera att containers körs: `docker ps`
3. Inspektera Neo4j logs: `docker compose logs neo4j`

### Port 3000 upptagen

Servers startar automatiskt på nästa lediga port. Kolla terminalen för aktuell port.

### Seed script misslyckas

1. Kontrollera att Neo4j är tillgänglig på http://localhost:7474
2. Verifiera credentials i `.env`
3. Kör `docker compose restart neo4j`

## Stoppa och rensa

```powershell
# Stoppa containers
docker compose down

# Stoppa och ta bort all data
docker compose down -v

# Starta från början
docker compose up -d
npm run seed
```

## Produktion

För produktion behöver du:
- Neo4j hosting (Aura, Railway, eller self-hosted)
- Uppdatera `NEO4J_URI` och credentials
- Deplooya Next.js till Vercel, Netlify eller liknande

Se [ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md) för mer info.
