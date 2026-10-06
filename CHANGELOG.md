# Changelog

## Sicherung 02 — `prisma8-runtime-2026-10-06`

Runtime-Migration von Prisma 6 auf Prisma-8-Patterns weitgehend abgeschlossen.

- PostgreSQL als lokale Datenbank
- P8-Reads und Writes in den zentralen Bereichen (Actions, Auth, Messaging, Presentation, Kern-Pages)
- Auth und Actions auf Prisma 8
- Bestehende P8-Helper und Mapper (`prisma8-temporal`, legacy-mappers, `*-p8` Query-Adapter)
- Bewusster P6-Restbestand: Home/Jobs/Candidates-Listen, `prisma/seed.ts`, `@prisma/client`-Typen/Enums, Prisma-6-CLI/Seed-Pipeline
- TypeScript, Build und Flow-/Parity-Tests erfolgreich
- Keine UI-/Produktänderungen

## Sicherung 01 — `mvp-baseline-2026-09-27`

Baseline-MVP WorkBridge (Pre-Production-Snapshot).

- Commit: `16038729a6dbdb69f71fa55d46ee2349b7f0b76f`
- Unveränderlicher Wiederherstellungspunkt vor der Prisma-8-/Postgres-Migration
