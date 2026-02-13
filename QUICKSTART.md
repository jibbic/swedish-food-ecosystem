# Swedish Food Ecosystem - Quick Start Guide

## 🚀 Kom igång på 5 minuter

### 1. Öppna projektet i terminal

```powershell
cd "S:\Martins kod\swedish-food-ecosystem"
```

### 2. Installera dependencies

```powershell
npm install
```

⏱️ Detta tar cirka 2-3 minuter första gången.

### 3. Starta Docker containers (Neo4j + PostgreSQL)

```powershell
npm run neo4j:start
```

⏱️ Första gången tar det 1-2 minuter att ladda ner images.

Verifiera att Neo4j är igång:
- Öppna http://localhost:7474
- Logga in: `neo4j` / `foodsystem2026`

### 4. Seed databasen med data

```powershell
npm run seed
```

För demoläge med nedladdad extern data:

```powershell
npm run data:download
npm run demo:seed
```

⏱️ Detta tar cirka 10-30 sekunder.

Du bör se:
```
🌱 Seeding database...
✅ Created 10 Verksamhetstyp nodes
✅ Created X Uppgiftskrav nodes
✅ Created Y Myndighet nodes
🎉 Seeding completed successfully
```

### 5. Starta utvecklingsserver

```powershell
npm run dev
```

Öppna http://localhost:3000 i din webbläsare! 🎉

---

## 🛠️ Vanliga kommandon

```powershell
# Development
npm run dev              # Start dev server på port 3000
npm run build            # Bygg för production
npm run start            # Kör production build

# Database
npm run neo4j:start      # Starta Neo4j + PostgreSQL
npm run neo4j:stop       # Stoppa databaser
npm run seed             # Återskapa data från scratch

# Code Quality
npm run lint             # ESLint check
npm run type-check       # TypeScript validation
```

---

## 📂 Projektstruktur

```
swedish-food-ecosystem/
├── src/
│   ├── app/                 # Next.js pages
│   │   ├── page.tsx         # Hemsida
│   │   ├── verksamheter/    # Verksamhetstyp-lista
│   │   └── api/trpc/        # Backend API
│   │
│   ├── components/ui/       # Återanvändbara komponenter
│   ├── lib/
│   │   ├── neo4j/          # Databas-integration
│   │   ├── trpc/           # API-lager
│   │   └── parsers/        # Data-importörer
│   └── types/              # TypeScript typer
│
├── docs/                   # Dokumentation
│   ├── architecture/       # System design
│   ├── requirements/       # Product requirements
│   └── decisions/          # ADRs
│
└── docker-compose.yml      # Docker setup
```

---

## 🐛 Felsökning

### Neo4j startar inte

```powershell
# Kolla Docker status
docker ps

# Se loggar
docker logs foodsystem-neo4j

# Starta om
npm run neo4j:stop
npm run neo4j:start
```

### Port redan upptagen

```powershell
# Om port 3000 redan används
set PORT=3001 && npm run dev
```

### Dependencies-problem

```powershell
# Rensa och återinstallera
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Nästa steg

1. Läs [README.md](./README.md) för projektöversikt
2. Kolla [docs/development/SETUP.md](./docs/development/SETUP.md) för detaljerad setup
3. Utforska [docs/architecture/](./docs/architecture/) för system design
4. Börja koda! Alla todos finns i [docs/requirements/PRODUCT_REQUIREMENTS.md](./docs/requirements/PRODUCT_REQUIREMENTS.md)

---

## 💡 Tips

- **Neo4j Browser**: http://localhost:7474 för att utforska grafen
- **Hot Reload**: Ändringar i kod uppdateras automatiskt
- **Type Safety**: tRPC ger autocomplete mellan frontend/backend
- **Tailwind IntelliSense**: Installera VS Code extension för CSS-hints

---

**Lycka till! 🚀**

Om du fastnar, kolla dokumentationen eller fråga om hjälp.
