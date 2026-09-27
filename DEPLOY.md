# WorkBridge live veröffentlichen (Vercel + Postgres)

## Deine zwei Präsentations-Links (nach Deploy)

Ersetze `DEINE-APP` durch deine Vercel-URL:

| Zweck | Link |
|--------|------|
| **Alles fertig (Ahmed)** | `https://DEINE-APP.vercel.app/de/demo/ready` |
| **Von null anfangen** | `https://DEINE-APP.vercel.app/de/start` |

---

## Schritt 1: PostgreSQL-Datenbank (Neon – kostenlos)

1. Gehe zu [neon.tech](https://neon.tech) und erstelle ein kostenloses Konto.
2. Neues Projekt anlegen → Region **Frankfurt (eu-central-1)** wählen.
3. **Connection string** kopieren (Format `postgresql://...?sslmode=require`).

---

## Schritt 2: Code auf GitHub

Im Terminal im Ordner `workbridge`:

```bash
git add .
git commit -m "Prepare WorkBridge for production deploy"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/workbridge.git
git push -u origin main
```

> Erstelle vorher auf github.com ein **neues leeres Repository** namens `workbridge` (ohne README).

---

## Schritt 3: Vercel-Projekt

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub-Repo **workbridge** importieren
3. **Root Directory:** `workbridge` (falls das Repo im übergeordneten Ordner liegt) – sonst leer lassen
4. **Environment Variables** setzen:

| Variable | Wert |
|----------|------|
| `DATABASE_URL` | Neon Connection String |
| `AUTH_SECRET` | Neues Geheimnis (siehe unten) |
| `NEXT_PUBLIC_APP_URL` | `https://DEINE-APP.vercel.app` (nach erstem Deploy anpassen) |
| `SMS_PROVIDER` | `mock` |

**AUTH_SECRET generieren** (Terminal):

```bash
openssl rand -base64 32
```

5. **Deploy** klicken

---

## Schritt 4: Demo-Daten einmalig laden

Nach dem ersten erfolgreichen Deploy, lokal im `workbridge`-Ordner:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

(Ersetze die URL durch deinen Neon-Connection-String.)

Damit werden Demo-Jobs, Firmen und der Ahmed-Hassan-Profil-Link vorbereitet.

---

## Schritt 5: URL prüfen

1. `https://DEINE-APP.vercel.app/de/demo/ready` → eingeloggt als Ahmed Hassan
2. `https://DEINE-APP.vercel.app/de/start` → Willkommensseite, neu registrieren

Falls `NEXT_PUBLIC_APP_URL` noch falsch war: in Vercel korrigieren → **Redeploy**.

---

## Updates später

Jeder `git push` auf `main` löst automatisch einen neuen Deploy aus.

---

## Alternative: Railway

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. **PostgreSQL** als Service hinzufügen
3. `DATABASE_URL` aus Railway in die App-Variablen verknüpfen
4. Gleiche Env-Vars wie oben setzen
5. Build Command: `npm run build` (package.json enthält bereits Prisma)

---

## Wichtig

- `.env` niemals committen (ist in `.gitignore`)
- Für die Präsentation reicht `SMS_PROVIDER=mock` (Code erscheint in der App)
- Demo-Nummer `+4915111111111` nur für den „fertig“-Link – bei `/de/start` eigene Nummer nutzen
