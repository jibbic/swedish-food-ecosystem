# Product Requirements Document

**Version**: 0.1.0  
**Last Updated**: 2026-02-12  
**Status**: In Development  
**Owner**: [Project Owner]

---

## Executive Summary

Swedish Food Ecosystem är en interaktiv kunskapsgraf som kartlägger och visualiserar Sveriges livsmedelssektors myndighetskrav, dataflöden och relationer. Systemet ska hjälpa både företagare att navigera regelverket och myndigheter att identifiera förenklingsmöjligheter.

---

## Vision & Goals

### Vision Statement
"Göra Sveriges livsmedelsrelaterade myndighetskrav transparenta, navigerbara och begripliga för alla aktörer."

### Primary Goals
1. **Transparens**: Visualisera komplexiteten i det digitala ekosystemet
2. **Navigerbarhet**: Hjälpa företagare hitta rätt krav snabbt
3. **Insikt**: Identifiera överlapp och förenklingsmöjligheter för myndigheter
4. **Skalbarhet**: Möjliggöra expansion till fler sektorer

### Success Metrics (6 månader)
- 500+ unika användare/månad
- 80% användare hittar rätt krav på <2 minuter
- 5+ myndigheter använder systemet för analys
- Minst 3 identifierade förenklingsmöjligheter

---

## Target Users

### Primary Persona: Nya Livsmedelsföretagare

**Profil:**
- Anna, 32, ska öppna en bageri-café
- Lite erfarenhet av myndighetskontakter
- Frustrerad över fragmenterad information
- Tekniskt van (använder digitala verktyg dagligen)

**Behov:**
- "Vilka krav gäller för min verksamhetstyp?"
- "Vilka myndigheter måste jag kontakta?"
- "Vad måste göras före öppning?"
- "Hur ofta kommer jag kontrolleras?"

**Pain Points:**
- Information spridd över 10+ myndighetssajter
- Osäker på vad som gäller just för bagerier
- Rädd att missa något viktigt
- Ingen översikt över tidslinje

---

### Secondary Persona: Myndighetsanalytiker

**Profil:**
- Johan, 45, arbetar på Tillväxtverket
- Analyserar företagsklimat och regelförenkling
- Behöver data för beslutsunderlag
- Van vid Excel och BI-verktyg

**Behov:**
- "Vilka krav ställer flera myndigheter?"
- "Var finns dubbelarbete för företagare?"
- "Hur många datapunkter kräver vi totalt?"
- "Visualisering för presentationer"

**Pain Points:**
- Ingen samlad bild av ekosystemet
- Svårt att kvantifiera överlapp
- Tid-intensiv manuell analys
- Ingen historisk data över förändringar

---

### Tertiary Persona: Befintlig Företagare (Expansion)

**Profil:**
- Maria, 38, driver restaurang, vill lägga till catering
- Känner till grundkraven
- Osäker på vad som ändras vid expansion

**Behov:**
- "Vad ändras om jag lägger till catering?"
- "Nya kontrollfrekvenser?"
- "Jämföra verksamhetstyper"

---

## Core Features

### F1: Verksamhetstyp-Explorer 🎯

**Priority**: P0 (Must-have MVP)

**User Story:**
> Som företagare vill jag välja min verksamhetstyp och direkt se alla relevanta krav, så att jag kan förbereda mig inför start.

**Functional Requirements:**
1. Dropdown/sökfunktion med alla Livsmedelsverkets verksamhetstyper
2. Visa riskklassning (1-5) med förklaring
3. Lista alla uppgiftskrav kopplat till verksamhetstypen
4. Visa vilka myndigheter som är involverade
5. Exportera som PDF/checklist

**Acceptance Criteria:**
- [ ] Minst 50 verksamhetstyper från LV API
- [ ] Riskklassning visas med visuell indikator (färg)
- [ ] Alla krav har länkar till myndighetssidor
- [ ] Mobile-responsive design
- [ ] Load time < 2s

**Data Sources:**
- Livsmedelsverkets Riskklassnings-API
- Uppgiftskrav.se XML

**Design Notes:**
- Card-baserat layout
- Färgkodning: Grön (risk 1-2), Gul (3), Röd (4-5)
- Tydlig CTA: "Visa alla krav"

---

### F2: Interaktiv Ekosystem-Graf 🕸️

**Priority**: P0 (Must-have MVP)

**User Story:**
> Som myndighetsanalytiker vill jag se en interaktiv graf över alla aktörer och relationer, så att jag kan identifiera överlapp och mönster.

**Functional Requirements:**
1. Force-directed graph med Cytoscape.js
2. Node types: Myndighet, Uppgiftskrav, Verksamhetstyp
3. Edge types: MÅSTE_UPPFYLLA, STÄLLS_AV
4. Click på node → highlight alla connections + detaljpanel
5. Filter panel:
   - Myndighet (multi-select)
   - Risknivå (slider 1-5)
   - Verksamhetskategori (Restaurang, Butik, etc.)
6. Zoom, pan, reset-vy
7. Sökfunktion (fuzzy search på node names)
8. Toggle layers (visa/dölj node types)

**Acceptance Criteria:**
- [ ] Render 200 nodes på < 3s
- [ ] Smooth 60fps när interagera
- [ ] Färgkodade nodes per typ
- [ ] Legend som förklarar färger
- [ ] Exportera graf som PNG
- [ ] Keyboard shortcuts (ESC = reset)

**Technical Constraints:**
- Max 500 nodes synliga samtidigt (performance)
- Lazy-load vid stora grafer (pagination)

**Design Notes:**
- Dark mode-friendly
- Tooltips på hover
- Icon-baserade node types
- Animated edges

---

### F3: Krav-Checklista & Wizard 📋

**Priority**: P1 (Should-have MVP)

**User Story:**
> Som företagare vill jag få en steg-för-steg guide med deadlines, så att jag inte missar något kritiskt.

**Functional Requirements:**
1. Genereras automatiskt baserat på vald verksamhetstyp
2. Sorterat efter deadline/prioritet:
   - Före verksamhetsstart
   - Inom 1 månad efter start
   - Återkommande (årligen, etc.)
3. Varje item:
   - Krav-namn
   - Myndighet (med kontaktinfo)
   - Deadline
   - Länk till ansökningsformulär (om finns)
   - Status (checkboxes - lokalt sparade)
4. Progress bar (X/Y klart)
5. Exportera som PDF eller JSON

**Acceptance Criteria:**
- [ ] Minst 80% av krav har deadlines
- [ ] Alla myndigheter har kontaktinfo
- [ ] Checkboxes sparas i localStorage
- [ ] PDF-export inkluderar alla länkar
- [ ] Mobile-optimerad

**Nice-to-have:**
- Email-påminnelser (kräver user accounts)
- Integration med kalender (iCal export)

---

### F4: Myndighetsöversikt 🏛️

**Priority**: P1 (Should-have MVP)

**User Story:**
> Som företagare vill jag se en översikt över alla relevanta myndigheter, så att jag vet vem jag ska kontakta.

**Functional Requirements:**
1. Lista alla myndigheter inom livsmedelssektorn
2. För varje myndighet visa:
   - Namn och logotyp
   - Ansvar (kort desc)
   - Kontaktuppgifter
   - Antal krav de ställer
   - Länkar till tjänster
3. Filtrera på typ (Statlig, Regional, Kommunal)
4. Sök på myndighetsnamn

**Acceptance Criteria:**
- [ ] Minst 15 myndigheter
- [ ] Alla har korrekta kontaktuppgifter
- [ ] Länkar till externa sajter öppnas i ny flik
- [ ] Responsive grid layout

---

### F5: Överlapp-Analys (Myndigheter) 🔍

**Priority**: P2 (Nice-to-have v0.2)

**User Story:**
> Som myndighetsanalytiker vill jag se vilka krav som ställs av flera myndigheter, så att jag kan föreslå samordning.

**Functional Requirements:**
1. Heatmap: Myndighet × Datatyp
2. Lista par av myndigheter med högst överlapp
3. Identifiera "datapunkter" som krävs >3 gånger
4. Exportera analysdata som CSV

**Acceptance Criteria:**
- [ ] Visuell heatmap (intensitet = antal överlapp)
- [ ] Top 10 överlapp rankade
- [ ] Filter på verksamhetstyp

---

## Non-Functional Requirements

### Performance
- **Initial Load**: First Contentful Paint < 1.5s
- **Graph Render**: 200 nodes på < 2s
- **API Response**: p95 < 500ms, p99 < 1s
- **Search**: Results på < 200ms

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation i graf (Tab, Arrow keys)
- Screen reader-friendly labels
- Color contrast ratio ≥ 4.5:1
- Alt text på alla images

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2)
- Safari (latest 2)
- Mobile: iOS Safari, Android Chrome

### Security
- Input validation med Zod
- Rate limiting: 100 requests/min/IP
- CORS korrekt konfigurerad
- Ingen känslig data i frontend (API keys i backend)

### Data Quality
- Datakällor synkas veckovis (automated cron)
- Manuell review av nya mappings (admin panel)
- Version-tracking av alla dataset-ändringar
- Rollback-funktion vid fel

### Internationalization (Future v2.0)
- Svenska (default)
- Engelska
- RTL-support ej planerad

---

## Out of Scope (v1.0)

Följande är **inte** inkluderat i första versionen:

- ❌ User accounts / personalisering
- ❌ Integration med Verksamt.se eller Bolagsverket
- ❌ Automatisk ansökningshjälp eller form-filling
- ❌ AI-driven recommendations
- ❌ Mobil-app (native)
- ❌ Offline-läge
- ❌ Multi-language (utom SV)
- ❌ andra sektorer än livsmedel

---

## Data Sources

| Source | Type | License | Update Freq | Owner | Status |
|--------|------|---------|-------------|-------|--------|
| [Uppgiftskrav.se](https://uppgiftskrav.se) | XML | CC0 | Realtid | Tillväxtverket | ✅ Active |
| [Livsmedelsverket Riskklassning](https://dataportal.livsmedelsverket.se) | REST API | Public | On-demand | Livsmedelsverket | ✅ Active |
| Bolagsverket (Future) | API | TBD | Daily | Bolagsverket | ❌ Planned v0.3 |
| SCB Företagsregister (Future) | CSV | Open | Monthly | SCB | ❌ Planned v0.4 |

---

## MVP Feature Prioritization

### Phase 0.1 (2 veckor) - Foundation
- [x] Project setup
- [ ] Database schema & seeding
- [ ] Basic UI components
- [ ] tRPC setup

### Phase 0.2 (2 veckor) - Core Features
- [ ] F1: Verksamhetstyp-Explorer
- [ ] F4: Myndighetsöversikt
- [ ] Data parsers för båda källor

### Phase 0.3 (3 veckor) - Visualization
- [ ] F2: Ekosystem-Graf
- [ ] Filter & search
- [ ] Responsive design

### Phase 0.4 (2 veckor) - UX Polish
- [ ] F3: Krav-Checklista
- [ ] PDF export
- [ ] Error handling & loading states
- [ ] Testing & documentation

### Launch (v1.0) - 9 veckor totalt
- Public beta release
- Feedback loop
- Performance optimization

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API data quality dålig | High | Medium | Manual validation, fallback till cached data |
| Neo4j performance issues | High | Low | Indexering, query optimization, pagination |
| Användare förstår ej grafen | Medium | Medium | Tutorial overlay, tooltips, improved legend |
| Data blir inaktuell | Medium | Medium | Automated weekly sync, version tracking |
| Scope creep | Medium | High | Strikt PRD adherence, post-MVP backlog |

---

## Dependencies

**External Services:**
- Uppgiftskrav.se (kan gå ner)
- Livsmedelsverket API (kan ändras)

**Technical:**
- Neo4j (kan inte enkelt ersättas)
- Vercel deployment (vendor lock-in)

---

## Future Roadmap (Post-MVP)

### v0.5 - Enhanced Analytics
- Överlapp-analys (F5)
- Historiska trender
- Statistik-dashboard

### v1.0 - Production Ready
- User accounts
- Saved searches & favoriter
- Email notifications
- Admin panel

### v2.0 - Multi-Sector
- Expansion till andra branscher
- Cross-sector analysis
- API för externa integrationer

---

## Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | [Name] | | |
| Tech Lead | [Name] | | |
| Stakeholder (Tillväxtverket) | | | |

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-12 | Initial | First draft - MVP scope |

---

**Related Documents:**
- [Architecture Overview](../architecture/ARCHITECTURE.md)
- [Data Model](../architecture/DATA_MODEL.md)
- [Setup Guide](../development/SETUP.md)
