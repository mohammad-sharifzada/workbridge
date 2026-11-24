# WorkBridge Deutschland

Produktionsnahe Web-App: Job-Marktplatz + Onboarding für Arbeit in Deutschland.

## Stack

- **Frontend:** Next.js 16 (App Router), Sass CSS Modules, next-intl
- **Backend:** Next.js Server Actions + API
- **DB:** Prisma ORM 8 (Release Candidate) + PostgreSQL, lokal und in Produktion
- **Auth:** SMS-Code (Mock/Twilio-ready) + E-Mail/Passwort für Unternehmen
- **i18n:** de, en, ar, tr, fa, uk (RTL für ar/fa)

## Schnellstart

Node.js 24 LTS und eine leere PostgreSQL-Datenbank bereitstellen. `.env.example` nach `.env` kopieren und `DATABASE_URL` sowie `AUTH_SECRET` setzen.

```bash
npm ci
npm run db:emit
npm run db:migrate
npm run db:seed
npm run dev
```

Öffnen: [http://localhost:3000/de](http://localhost:3000/de)

### Demo-Zugänge

| Rolle | Login |
|-------|--------|
| Unternehmen | `firma@demo.de` / `demo1234` |
| Arbeitssuchende | Telefon `+4915111111111` → SMS-Code wird in der UI angezeigt (Mock) |

## Styling

Seiten und Komponenten importieren ihre jeweils benachbarte `*.module.scss`-Datei. Zustände verwenden lokale Klassen, bei Bedarf kombiniert mit `clsx`. Gemeinsame Breakpoints und Mixins liegen in `src/styles/_design.scss`; die globalen Farbvariablen und der Seitenhintergrund stehen in `src/app/globals.scss`.

### Tailwind optional aktivieren

Der Standard-Build benötigt kein Tailwind. Wenn du es für neue Komponenten verwenden möchtest:

1. Installiere `npm install -D tailwindcss@^4 @tailwindcss/postcss@^4`.
2. Lege im Projektstamm `postcss.config.mjs` an:

   ```js
   export default { plugins: { "@tailwindcss/postcss": {} } };
   ```

3. Ergänze `import "../styles/tailwind.optional.css";` in `src/app/layout.tsx` und starte den Dev-Server neu. Die Hilfsklassen haben das Präfix `tw:` (z. B. `tw:flex`); Tailwind Preflight wird nicht geladen.

## PostgreSQL-Migrationen

Die Schemaquelle ist [`prisma/contract.prisma`](./prisma/contract.prisma). `npm run db:emit` erzeugt die Typen und den Laufzeitvertrag in `src/prisma`. `npm run build` benötigt keine Datenbankverbindung und verändert keine Daten.

**Neue Datenbank:** `npm run db:migrate` wendet die vorhandenen Migrationen an. `npm run db:seed` ist optional, ist nur für eine leere Demo-Datenbank gedacht und löscht keine Daten.

**Bestehende WorkBridge-Datenbank:** Vor dem ersten v8-Deploy ein Backup erstellen und die folgenden Befehle mit `DATABASE_URL` für die Zieldatenbank ausführen:

```bash
npm run db:emit
npm run db:sign
npm run db:verify -- --strict
npm run db:migrate
```

`db:sign` prüft die vorhandene Struktur und registriert sie als v8-Baseline. Stimmt das Schema überein, wird die initiale Migration nicht erneut ausgeführt. Bei Schemaabweichungen meldet die Prüfung die Unterschiede; diese vor dem Deploy klären.

**Spätere Schemaänderungen:** Vertrag ändern, Migration planen und prüfen, dann anwenden:

```bash
npm run db:emit
npm run db:plan -- --name meine-aenderung
npm run db:migrate
npm run db:verify -- --strict
```

Siehe den offiziellen [Prisma-8-Migrationsleitfaden für PostgreSQL](https://www.prisma.io/docs/guides/upgrade-prisma-orm/postgresql) und das [Handover-Beispiel](https://github.com/prisma/orm/tree/main/examples/prisma7-adoption).

## Live veröffentlichen

**Netlify (empfohlen, wenn du schon Netlify nutzt):** siehe [`NETLIFY.md`](./NETLIFY.md)  
**Alternative Railway/Vercel:** siehe [`LIVE.md`](./LIVE.md) / [`DEPLOY.md`](./DEPLOY.md)

Nach dem Deploy auf Netlify:

- Fertig: `https://DEINE-SITE.netlify.app/de/demo/ready`
- Neustart: `https://DEINE-SITE.netlify.app/de/start`

## Twilio SMS

```
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...
```

Hook-Stelle: `src/lib/auth.ts` → `createVerificationCode`.

## Dokumentation

Siehe `DOKUMENTATION.md` für implementierte Funktionen, Verbesserungen und Zusatzfeatures (Korso).
