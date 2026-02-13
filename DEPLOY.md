# Deployment Guide - Lokal Server

Guide för att deploya Swedish Food Ecosystem på en lokal server (192.168.1.12).

## Förutsättningar på servern

- **Docker** och **Docker Compose** installerat
- **Git** installerat
- **Port 3000** (Next.js), **7474** (Neo4j Browser), **7687** (Neo4j Bolt), **5432** (PostgreSQL) tillgängliga

## Installation

### 1. Klona projektet

```bash
cd /path/to/projects
git clone https://github.com/jibbic/swedish-food-ecosystem.git
cd swedish-food-ecosystem
```

### 2. Skapa .env-fil

Kopiera exempel-filen och använd standardvärden:

```bash
cp .env.example .env
```

Innehåll i `.env`:
```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=foodsystem2026

# Database
DATABASE_URL=postgresql://foodsystem:foodsystem2026@localhost:5432/foodsystem

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://192.168.1.12:3000

# Data Sources
UPPGIFTSKRAV_XML_URL=https://www.uppgiftskrav.se/uppgiftskrav/files/uppgiftskrav.xml
UPPGIFTSKRAV_XML_FILE=./data/external/uppgiftskrav.xml
UPPGIFTSKRAV_INCLUDE_ALL=false
LIVSMEDELSVERKET_API_URL=https://dataportal.livsmedelsverket.se/riskklassningkodverk/api
```

**Viktigt:** Ändra `NEXT_PUBLIC_APP_URL` till serverns IP: `http://192.168.1.12:3000`

### 3. Starta databaser med Docker

```bash
docker compose up -d
```

Detta startar:
- **Neo4j** på port 7474 (Browser) och 7687 (Bolt)
- **PostgreSQL** på port 5432

Vänta 10-15 sekunder för att Neo4j ska bli redo.

### 4. Installera dependencies

Om Node.js och npm finns på servern:

```bash
npm install
```

**Alternativt:** Om du vill köra allt i Docker, se [Docker-only deployment](#docker-only-deployment) längre ned.

### 5. Seed databasen

Fyll Neo4j med data från Uppgiftskrav.se och Livsmedelsverket:

```bash
npm run seed
```

Detta tar cirka 30-60 sekunder och skapar:
- Verksamhetstyper (~10 noder)
- Uppgiftskrav och Myndigheter (från uppgiftskrav.xml)
- Relationer mellan dem

### 6. Starta utvecklingsservern

```bash
npm run dev
```

Applikationen är nu tillgänglig på:
- **Frontend:** http://192.168.1.12:3000
- **Neo4j Browser:** http://192.168.1.12:7474
  - Username: `neo4j`
  - Password: `foodsystem2026`

## Produktionsbygge (valfritt)

För bättre prestanda i produktion:

```bash
npm run build
npm start
```

## Verifiera installation

1. **Neo4j Browser:** http://192.168.1.12:7474
   ```cypher
   MATCH (n) RETURN count(n) as totalNodes
   ```
   Du bör se >100 noder.

2. **Frontend:** http://192.168.1.12:3000
   - Testa ekosystem-grafen
   - Bläddra i verksamhetstyper
   - Kör wizard

## Felsökning

### Neo4j anslutning misslyckas

```bash
# Kontrollera att Neo4j är igång
docker ps

# Se loggar
docker logs foodsystem-neo4j

# Starta om
docker compose restart neo4j
```

### Port redan används

Om port 3000, 7474, 7687 eller 5432 redan används, ändra i `docker-compose.yml`:

```yaml
ports:
  - "8080:7474"  # Neo4j Browser på port 8080 istället
  - "7688:7687"  # Neo4j Bolt på 7688
```

Uppdatera sedan `.env` med nya portar.

### Seed misslyckas

Om `npm run seed` misslyckas med connection error:

```bash
# Vänta lite längre
sleep 20

# Försök igen
npm run seed
```

## Stoppa tjänsterna

```bash
# Stoppa Next.js (Ctrl+C i terminalen)

# Stoppa Docker containers
docker compose down

# Radera data (OBS: Tar bort all data!)
docker compose down -v
```

## Uppdatera från Git

```bash
git pull origin main
npm install  # Om package.json ändrats
docker compose restart  # Om docker-compose.yml ändrats
npm run seed  # Om du vill återskapa databasen
npm run dev
```

## Docker-only deployment

Om du vill köra hela applikationen i Docker (utan Node.js på servern), skapa en `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Och uppdatera `docker-compose.yml` för att inkludera Next.js-kontainern.

## Support

- **Dokumentation:** Se README.md och /docs
- **Issues:** https://github.com/jibbic/swedish-food-ecosystem/issues
