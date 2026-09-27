# WorkBridge Deutschland

Produktionsnahe Web-App: Job-Marktplatz + Onboarding für Arbeit in Deutschland.

## Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, next-intl
- **Backend:** Next.js Server Actions + API
- **DB:** Prisma 6 + SQLite (lokal) / PostgreSQL (Produktion)
- **Auth:** SMS-Code (Mock/Twilio-ready) + E-Mail/Passwort für Unternehmen
- **i18n:** de, en, ar, tr, fa, uk (RTL für ar/fa)

## Schnellstart

```bash
cd workbridge
npm install
npm run db:push
npm run db:seed
npm run dev
```

Öffnen: [http://localhost:3000/de](http://localhost:3000/de)

### Demo-Zugänge

| Rolle | Login |
|-------|--------|
| Unternehmen | `firma@demo.de` / `demo1234` |
| Arbeitssuchende | Telefon `+4915111111111` → SMS-Code wird in der UI angezeigt (Mock) |

## PostgreSQL (Produktion / Live)

Lokal und live wird **PostgreSQL** genutzt (z. B. kostenlos bei [Neon](https://neon.tech)).

In `.env`:

```
DATABASE_URL="postgresql://USER:PASS@HOST:5432/workbridge?sslmode=require"
```

Schema anwenden und Demo-Daten:

```bash
npm run db:push
npm run db:seed
```

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
