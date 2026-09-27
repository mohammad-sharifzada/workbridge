# WorkBridge live – funktioniert auf Handy, Laptop, überall

**Am einfachsten mit Railway** (1 Plattform: App + Datenbank, kostenloser Start).

---

## In 10 Minuten live

### Schritt 1: Railway-Konto
1. Öffne **[railway.app](https://railway.app)**
2. Mit **GitHub** anmelden (kostenlos)

### Schritt 2: Neues Projekt
1. **New Project** → **Deploy from GitHub repo**
2. Falls noch kein Repo: zuerst Code auf GitHub pushen (siehe unten)
3. Repo **workbridge** auswählen

### Schritt 3: PostgreSQL hinzufügen
1. Im Projekt: **+ New** → **Database** → **PostgreSQL**
2. Postgres anklicken → Tab **Variables** → `DATABASE_URL` kopieren (oder **Connect** → **Public URL**)

### Schritt 4: App-Variablen setzen
Auf deiner **WorkBridge-App** (nicht Postgres) → **Variables**:

| Name | Wert |
|------|------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway-Verknüpfung) oder die kopierte URL |
| `AUTH_SECRET` | Ein langes Geheimnis, z. B. `workbridge-live-secret-2026-min32chars!!` |
| `NEXT_PUBLIC_APP_URL` | Erst leer lassen – nach Deploy eintragen (Schritt 6) |
| `SMS_PROVIDER` | `mock` |
| `SEED_ON_DEPLOY` | `true` (nur beim ersten Deploy) |

### Schritt 5: Deploy
Railway baut automatisch. Warten bis **Success** (ca. 3–5 Min.).

### Schritt 6: Öffentliche URL
1. App → **Settings** → **Networking** → **Generate Domain**
2. Du bekommst z. B. `workbridge-production.up.railway.app`
3. Variable `NEXT_PUBLIC_APP_URL` setzen auf: `https://workbridge-production.up.railway.app`
4. **Redeploy** (Deployments → … → Redeploy)

### Schritt 7: Nach erstem Deploy – Demo-Daten
Wenn `SEED_ON_DEPLOY=true` gesetzt war, sind Demo-Jobs schon da.  
Sonst einmal lokal:

```bash
cd workbridge
DATABASE_URL="postgresql://..." npm run db:seed
```

Danach `SEED_ON_DEPLOY` wieder **löschen** (sonst werden bei jedem Deploy Daten zurückgesetzt).

---

## Deine Live-Links (Handy + alle Geräte)

Ersetze `DEINE-URL` durch deine Railway-Domain:

| Zweck | Link |
|--------|------|
| **Alles fertig (Ahmed)** | `https://DEINE-URL/de/demo/ready` |
| **Von null anfangen** | `https://DEINE-URL/de/start` |

Diese Links funktionieren **überall** – Handy, Tablet, anderer Laptop – solange Railway läuft (24/7, Mac kann aus sein).

---

## Code auf GitHub (einmalig)

Falls noch nicht geschehen:

1. Auf [github.com](https://github.com) → **New repository** → Name: `workbridge` → **Create** (ohne README)

2. Im Terminal:

```bash
cd "/Users/user/Job App /workbridge"
git add .
git commit -m "WorkBridge ready for live deploy"
git branch -M main
git remote add origin https://github.com/DEIN-GITHUB-NAME/workbridge.git
git push -u origin main
```

Dann in Railway das Repo verbinden.

---

## Was ist was? (kurz)

| Name | Wofür |
|------|--------|
| **GitHub** | Code speichern – Railway holt sich den Code von dort |
| **Railway** | App im Internet hosten + Link für alle Geräte |
| **PostgreSQL** | Datenbank in der Cloud (Nutzer, Jobs, Profile) |
| **Stripe** | ❌ Nicht nötig – ist nur für Zahlungen |
| **Netlify** | ⚠️ Möglich, aber mit Postgres extra – Railway ist einfacher |
| **Supabase** | ⚠️ Nur Datenbank – App müsste extra woanders laufen |

---

## Hilfe

- Build-Fehler in Railway → **Deployments** → Logs öffnen
- Seite lädt nicht → `NEXT_PUBLIC_APP_URL` prüfen und redeployen
- Demo-Login geht nicht → `npm run db:seed` mit Production-`DATABASE_URL` ausführen
